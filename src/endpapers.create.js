Endpapers.create = function ( Settings ) {

    // Load ExtendScript-Modules
    var Rulers    = Sky.getUtil("rulers",    Sky.throwCallback($.fileName, $.line));
    var LayerUtil = Sky.getUtil("layer",     Sky.throwCallback($.fileName, $.line));
    var PageItems = Sky.getUtil("pageitems", Sky.throwCallback($.fileName, $.line));

    // We need to validate settings here
    // 1. Do page margins fit within page or do we set them to 0 if not fitting?
    // 2. Is the size of the page bigger then min page size of InDesign

    // Set defaults
    with (app.marginPreferences){
        // Save the current application default margin preferences
        var originalTop    = top;
        var originalLeft   = left;
        var originalBottom = bottom;
        var originalRight  = right;
        var originalColumnGutter = columnGutter;
        var originalColumnCount  = columnCount;
        
        // Set the application default margin preferences.
        top    = Settings.marginTop   + "mm";
        left   = Settings.marginLeft  + "mm";
        bottom = Settings.marginBot   + "mm";
        right  = Settings.marginRight + "mm";
        columnGutter = 0;
        columnCount  = 1;
    };

    // Make a new document.
    var Doc = app.documents.add();

    var originalRulers = Rulers.set( Doc, Settings.units );

    // Safe title in meta
    Doc.metadataPreferences.documentTitle = Settings.booktitle;
    
    try {
        with(Doc.documentPreferences){
            pageHeight  = Settings.height;
            pageWidth   = Settings.width;
            facingPages = true;
            //Bleed
            documentBleedUniformSize = true;
            documentBleedTopOffset   = Settings.bleed;
            // Slug
            documentSlugUniformSize = true;
            slugTopOffset = (Settings.bleed + 5);
        };
    } catch(err){
        alert("InDesign can't create a page that size.");
        return err;
    };

    var myEndPaperSpread = Doc.spreads.add(LocationOptions.AFTER,Doc.spreads[0]);
    
    // get Layer
    var myLayer = LayerUtil.select(Doc, "Art", true);
    // unlock layer
    var originalLock = LayerUtil.locker(myLayer, false);

    var myRect = PageItems.addRectToBleed( myEndPaperSpread, {itemLayer:myLayer, contentType:ContentType.GRAPHIC_TYPE} );

    // restore layer lock
    LayerUtil.locker(myLayer, originalLock);

    // duplicate the page
    Doc.spreads[0].duplicate(LocationOptions.AFTER, Doc.spreads[1]);
    
    // Now have the basic settings we can duplicate this setup for the back end-papers
    var spreadLen = Doc.spreads.length;
    for(var i=0; i<spreadLen; i++){
        Doc.spreads[i].allowPageShuffle = false;
        Doc.spreads[i].duplicate(LocationOptions.AFTER, Doc.spreads[Doc.spreads.length-1]);
    }

    Doc.pages[0].label = "Stuckdown";
    Doc.pages[Doc.pages.length-1].label = "Stuckdown";
    
    // Add the Stuck-down text on first and last page
    //var myParagraphStyle = CB.Slugs.getMeasureParagraphStyle(CB, Doc, "measurements", CB.Settings.registration_font);
    //var regLayer         = CB.Tools.getAndSelectLayer(  Doc, "Registration");

    //var myPage = Doc.pages[0];
    //var PageIO = CB.Tools.makePageInfoObject(CB, Doc, myPage, 0);
    //CB.Tools.addTextFrame(CB, myPage, PageIO.bounds, "< Stuckdown >", myParagraphStyle, 0, "Stuck-down");

    //myPage = Doc.pages[Doc.pages.length-1];
    //PageIO = CB.Tools.makePageInfoObject(CB, Doc, myPage, 0);
    //CB.Tools.addTextFrame(CB, myPage, PageIO.bounds, "< Stuckdown >", myParagraphStyle, 0, "Stuck-down");

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
    Rulers.set(Doc, originalRulers);

    return Doc;

};
