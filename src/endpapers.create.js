Endpapers.create = function ( ) {

    // Load ExtendScript-Modules
    var Rulers    = Sky.getUtil("rulers");
    var LayerUtil = Sky.getUtil("layer");

    var booktitle = "Untitled";
    
    var data = { width       : 0,
                 height      : 0,
                 bleed       : 5,
                 marginTop   : 0,
                 marginBot   : 0, 
                 marginLeft  : 0, 
                 marginRight : 0 };

    var sourceDoc = app.documents[0];
    if( sourceDoc.isValid ) {
        booktitle = sourceDoc.metadataPreferences.documentTitle;
 
        // OK, lets get the width, height and margins of source document
        // An InDesign document has at least one page
        // Save old rulers and set rulers to mm to get all measurements in mm
        var originalRulers = Rulers.set(sourceDoc, "mm");

        data = { width       : sourceDoc.documentPreferences.pageWidth,
                 height      : sourceDoc.documentPreferences.pageHeight,
                 bleed       : sourceDoc.documentPreferences.documentBleedTopOffset,
                 marginTop   : sourceDoc.pages[0].marginPreferences.top,
                 marginBot   : sourceDoc.pages[0].marginPreferences.bottom, 
                 marginLeft  : sourceDoc.pages[0].marginPreferences.left, 
                 marginRight : sourceDoc.pages[0].marginPreferences.right }

        // reset original rulers
        Rulers.set(sourceDoc, originalRulers);
    };

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
                // MeasurementEditbox values are always in points
                var widthField  = measurementEditboxes.add({ editUnits: MeasurementUnits.MILLIMETERS, editValue: Rulers.convert(data.width,  "mm", "pt", 3) });
                var heightField = measurementEditboxes.add({ editUnits: MeasurementUnits.MILLIMETERS, editValue: Rulers.convert(data.height, "mm", "pt", 3) });
                var bleedField  = measurementEditboxes.add({ editUnits: MeasurementUnits.MILLIMETERS, editValue: Rulers.convert(data.bleed,  "mm", "pt", 3) });
            } 
        }
    };
    
    if(dlg.show() == true){
        data.height = Rulers.convert(heightField.editValue, "pt", "mm", 3); 
        data.width  = Rulers.convert(widthField.editValue,  "pt", "mm", 3); 
        data.bleed  = Rulers.convert(bleedField.editValue,  "pt", "mm", 3); 
    } else {
        return "User pressed cancel";
    };

    // Create a new doc based on those values
    
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
    };

    // Make a new document.
    var doc = app.documents.add();
    
    // set rulers to mm
    var originalRulers = Rulers.set( doc, "mm" );

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
    };
    
    var myEndPaperSpread = doc.spreads.add(LocationOptions.AFTER,doc.spreads[0]);
    
    // get Layer
    var myLayer = LayerUtil.getSelect(doc, "Art", true);

    // unlock layer
    var originalLock = LayerUtil.locker(myLayer, false);

    var myRect = CB.Tools.newRect2SpreadBleed(CB, doc, myEndPaperSpread, myLayer, 0);
    myRect.contentType = ContentType.GRAPHIC_TYPE;
    
    // restore layer
    CB.Tools.layerLocked(myLayer, originalLock);
    
    // duplicate the page
    doc.spreads[0].duplicate(LocationOptions.AFTER, doc.spreads[1]);
    
    // Now have the basic settings we can duplicate this setup for the back end-papers
    var spreadLen = doc.spreads.length;
    for(var i=0; i<spreadLen; i++){
        doc.spreads[i].allowPageShuffle = false;
        doc.spreads[i].duplicate(LocationOptions.AFTER, doc.spreads[doc.spreads.length-1]);
    }

    // Add the Stuck-down text on first and last page

    var myParagraphStyle = CB.Slugs.getMeasureParagraphStyle(CB, doc, "measurements", CB.Settings.registration_font);
    var regLayer         = CB.Tools.getAndSelectLayer(  doc, "Registration");

    var myPage = doc.pages[0];
    var PageIO = CB.Tools.makePageInfoObject(CB, doc, myPage, 0);
    CB.Tools.addTextFrame(CB, myPage, PageIO.bounds, "< Stuckdown >", myParagraphStyle, 0, "Stuck-down");

    myPage = doc.pages[doc.pages.length-1];
    PageIO = CB.Tools.makePageInfoObject(CB, doc, myPage, 0);
    CB.Tools.addTextFrame(CB, myPage, PageIO.bounds, "< Stuckdown >", myParagraphStyle, 0, "Stuck-down");
    
    //Reset the application default margin preferences to their former state.
    with (app.marginPreferences){
        top    = originalTop;
        left   = originalLeft;
        bottom = originalBottom;
        right  = originalRight;
        columnGutter = originalColumnGutter;
        columnCount  = originalColumnCount;
    };

    // reset original rulers
    Rulers.set(doc, originalRulers);

};
