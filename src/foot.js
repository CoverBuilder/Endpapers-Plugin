
try {
    myApp.createEndpapers();
} catch( err ) {
    alert("Endpapers Plugin:\n" + err.message + " (Line " + err.line + " in file " + err.fileName + ")");
};
