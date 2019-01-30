Endpapers.getDocSettings = function( Doc, measureUnit ) {

    if(!Doc.isValid) {
        throw new Error("Endpapers.getDocSettings: Doc is not a valid document.");
    };
    
    // Load ExtendScript-Modules
    var Rulers = Sky.getUtil("rulers", Sky.throwCallback($.fileName, $.line));

    var originalRulers = Rulers.set( Doc, measureUnit );

    var DocSettings = {
        booktitle   : Doc.metadataPreferences.documentTitle,
        units       : measureUnit,
        width       : Doc.documentPreferences.pageWidth,
        height      : Doc.documentPreferences.pageHeight,
        bleed       : Doc.documentPreferences.documentBleedTopOffset,
        marginTop   : Doc.marginPreferences.top,
        marginBot   : Doc.marginPreferences.bottom,
        marginLeft  : Doc.marginPreferences.left,
        marginRight : Doc.marginPreferences.right
    };

    Rulers.set( Doc, measureUnit );

    return DocSettings;
};
