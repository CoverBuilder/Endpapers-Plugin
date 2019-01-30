#include "../staging/com.brunoherfst.endpapers/Endpapers.jsx"

var Settings = { booktitle   : "Test",
                 units       : "mm",
                 width       : 210,
                 height      : 297,
                 bleed       : 5,
                 marginTop   : 10,
                 marginBot   : 10, 
                 marginLeft  : 10, 
                 marginRight : 10 };

var Doc = Endpapers.create( Settings );
var pageCount = Doc.pages.length;
var spreadCount = Doc.spreads.length;

Doc.close(SaveOptions.NO);

$.writeln( pageCount === 8 && spreadCount === 6 );
