
myApp.createEndpapers = function ( CB ) {

    var booktitle = "Untitled";
    
    var data = { width       : 0,
                 height      : 0,
                 bleed       : 5,
                 marginTop   : 0,
                 marginBot   : 0, 
                 marginLeft  : 0, 
                 marginRight : 0 }

    var sourceDoc = CB.Tools.getActiveCover(CB, true, true);
    if( sourceDoc != null ) {
        if( sourceDoc.isValid ) {

            // Don't save title in original doc as it is not guaranteed the same book
            booktitle = CB.Tools.getBookTitle(CB, sourceDoc, true);
            
            // OK, lets get the width, height and margins of current doc
            // An InDesign document has at least one page
            // Save old rulers and set rulers to points to get all measurements in mm
            var originalRulers = CB.Tools.setRuler(sourceDoc, {units : 0});
    
            data = { width       : sourceDoc.documentPreferences.pageWidth,
                     height      : sourceDoc.documentPreferences.pageHeight,
                     bleed       : sourceDoc.documentPreferences.documentBleedTopOffset,
                     marginTop   : sourceDoc.pages[0].marginPreferences.top,
                     marginBot   : sourceDoc.pages[0].marginPreferences.bottom, 
                     marginLeft  : sourceDoc.pages[0].marginPreferences.left, 
                     marginRight : sourceDoc.pages[0].marginPreferences.right }

            // reset original rulers
            CB.Tools.setRuler(sourceDoc, originalRulers);
        }
    }

    // Create dialog for size
    var dlg = app.dialogs.add({name:"Create Endpapers"});
    with(dlg.dialogColumns.add()){
        with(dialogRows.add()){
            with(dialogColumns.add()){
                var widthLabel  = staticTexts.add({staticLabel:"Width:"});
                var heightLabel = staticTexts.add({staticLabel:"Height:"});
                var bleedLabel  = staticTexts.add({staticLabel:"Bleed:"});
            }
            with(dialogColumns.add()){
                var widthField  = measurementEditboxes.add({editUnits: MeasurementUnits.MILLIMETERS,editValue:CB.NumCon.convert(CB, data.width,  0, 2, 3)});
                var heightField = measurementEditboxes.add({editUnits: MeasurementUnits.MILLIMETERS,editValue:CB.NumCon.convert(CB, data.height, 0, 2, 3)});
                var bleedField  = measurementEditboxes.add({editUnits: MeasurementUnits.MILLIMETERS,editValue:CB.NumCon.convert(CB, data.bleed,  0, 2, 3)});
            } 
        }
    }
    
    if(dlg.show() == true){
        data.height = CB.NumCon.convert(CB, heightField.editValue, 2, 0, 3); 
        data.width  = CB.NumCon.convert(CB, widthField.editValue,  2, 0, 3); 
        data.bleed  = CB.NumCon.convert(CB, bleedField.editValue,  2, 0, 3); 
    } else {
        return "User pressed cancel";
    }
    
    // Then create a new doc based on those values
    
    //Set the application default margin preferences.
    with (app.marginPreferences){
        //Save the current application default margin preferences.
        var originalTop    = top;
        var originalLeft   = left;
        var originalBottom = bottom;
        var originalRight  = right;
        var originalColumnGutter = columnGutter;
        var originalColumnCount  = columnCount;
        
        //Set the application default margin preferences.
        top    = data.marginTop + "mm";
        left   = data.marginLeft + "mm";
        bottom = data.marginBot + "mm";
        right  = data.marginRight + "mm";
        columnGutter = 0;
        columnCount  = 1;
    }

    // Make a new document.
    var doc = app.documents.add();
    
    // set rulers to mm
    var originalRulers = CB.Tools.setRuler(doc, {units : 0});

    // safe the title as meta data
    doc.metadataPreferences.documentTitle = booktitle;
    
    try {
        with(doc.documentPreferences){
            pageHeight  = data.height;
            pageWidth   = data.width;
            facingPages = true;
            //Bleed
            documentBleedUniformSize = true;
            documentBleedTopOffset   = data.bleed;
            // Slug
            documentSlugUniformSize = true;
            slugTopOffset = (data.bleed + 5);
        }
    } catch(err){
        alert("InDesign can't create a page that size.");
        return;
    }
    
    var myEndPaperSpread = doc.spreads.add(LocationOptions.AFTER,doc.spreads[0]);
    
    // get Layer
    var myLayer = CB.Tools.getAndSelectLayer(doc, "Art");
    // unlock layer
    var originalLock = CB.Tools.layerLocked(myLayer, false);

    var myRect = CB.Tools.newRect2SpreadBleed(CB, doc, myEndPaperSpread, myLayer, 0);
    myRect.contentType = ContentType.GRAPHIC_TYPE;
    
    // restore layer
    CB.Tools.layerLocked(myLayer, originalLock);
    
    // duplicate the page
    doc.spreads[0].duplicate(LocationOptions.AFTER, doc.spreads[1]);
    
    // Now have the basic settings we can duplicate this setup for the back endpapers
    var spreadLen = doc.spreads.length;
    for(var i=0; i<spreadLen; i++){
        doc.spreads[i].allowPageShuffle = false;
        doc.spreads[i].duplicate(LocationOptions.AFTER, doc.spreads[doc.spreads.length-1]);
    }

    // Add the Stuckdown text on first and last page

    var myParagraphStyle = CB.Slugs.getMeasureParagraphStyle(CB, doc, "measurements", CB.Settings.registration_font);
    var regLayer         = CB.Tools.getAndSelectLayer(  doc, "Registration");

    var myPage = doc.pages[0];
    var PageIO = CB.Tools.makePageInfoObject(CB, doc, myPage, 0);
    CB.Tools.addTextFrame(CB, myPage, PageIO.bounds, "< Stuckdown >", myParagraphStyle, 0, "Stuckdown");

    myPage = doc.pages[doc.pages.length-1];
    PageIO = CB.Tools.makePageInfoObject(CB, doc, myPage, 0);
    CB.Tools.addTextFrame(CB, myPage, PageIO.bounds, "< Stuckdown >", myParagraphStyle, 0, "Stuckdown");
    
    //Reset the application default margin preferences to their former state.
    with (app.marginPreferences){
        top    = originalTop;
        left   = originalLeft;
        bottom = originalBottom;
        right  = originalRight;
        columnGutter = originalColumnGutter;
        columnCount  = originalColumnCount;
    }

    // reset original rulers
    CB.Tools.setRuler(doc, originalRulers);
};
