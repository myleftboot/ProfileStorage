// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#000');

var iterations = 1000;
var started;

var win1 = Titanium.UI.createWindow({  
    title:'Storage Profiler',
    backgroundColor:'#000'
});

function start(_args) {
	progressBar.message = 'Writing '+ iterations + ' '+ _args.message
	started = new Date;
}

function end(_args) {
	var end = new Date;
	_args.obj.text = end - started+ 'ms';
}

function resetPB(_args) {
	progressBar.setValue = progressBar.getMin();
	progressBar.setMessage(_args.message);
}
var vw = Ti.UI.createView({layout: 'vertical'});

var label = Ti.UI.createLabel({text:  'Compare the performance of Properties, database and files'
                              ,color: '#888'
                              ,height: 40});

var dummySpace = Ti.UI.createView({height:30});

var progressBar = Ti.UI.createProgressBar({
	min:   0,
	max:   1000,
	value: 0,
	color: '#fff',
	message: 'writing '+ iterations + ' records'
});

var testProperties = Ti.UI.createButton({
	title:		'Test Properties',
	height:		40,
	width:		150,
});

testProperties.addEventListener('click', function() {
	start({message: 'properties'});
	for (i=0; i< iterations; i++ ) {
		Ti.App.Properties.setInt('P'+i, i);
		progressBar.setValue(i);
	}
	resetPB({message: 'Reading '+iterations+ ' properties'});
	var result;
	for (i=0; i< iterations; i++ ) {
		result += Ti.App.Properties.getInt('P'+i, i);
		progressBar.setValue(i);
	}
	end({obj: propertiesResult});
})

propertiesResult = Ti.UI.createLabel({
	color: '#fff',
	height: 40
});

var testDatabase = Ti.UI.createButton({
	title:		'Test Database',
	height:		40,
	width:		150,
});

testDatabase.addEventListener('click', function() {

	start({message: 'database'});
	
	var db = Ti.Database.install('profiler', 'theProfiler');
	db.file.setRemoteBackup(false);
	db.execute('CREATE TABLE IF NOT EXISTS profiler  (id INTEGER)');
    db.execute('DELETE FROM profiler');
    // insert an array of values
    var insArr = [];
	for (i=0; i< iterations; i++ ) {
		insArr[i] = i;
		progressBar.setValue(i);
	}
	db.execute('INSERT INTO profiler(id) VALUES (?)', insArr);
	
	resetPB({message: 'Reading '+iterations+ ' database entries'});
	var result;
	for (i=0; i< iterations; i++ ) {
		result += Ti.App.Properties.getInt('P'+i, i);
		progressBar.setValue(i);
	}
	db.close();
	end({obj: databaseResult});
})

databaseResult = Ti.UI.createLabel({
	color: '#fff',
	height: 40
});

var testFile = Ti.UI.createButton({
	title:		'Test File',
	height:		40,
	width:		150,
});

testFile.addEventListener('click', function() {
	start({message: 'file'});
	var theFile = Ti.Filesystem.createTempFile();
	var result;
	for (i=0; i< iterations; i++ ) {
		theFile.write(i+' ', true);
		progressBar.setValue(i);
	}
	
	resetPB({message: 'Reading '+iterations+ ' records from file'});
	// Read the contents of the file
	// We can only get the whole file as a blob
	// so we have a bit of work to do to process it
	var contents = new String(theFile.read().toString); // read file and convert it to a string

	var contentsArr = contents.split(' ');
	for (i=0; i< contentsArr.length; i++ ) {
		result += contentsArr[i];
		progressBar.setValue(i);
	}
	end({obj: fileResult});
})

fileResult = Ti.UI.createLabel({
	color: '#fff',
	height: 40
});

vw.add(label);
vw.add(dummySpace);
vw.add(testProperties);
vw.add(propertiesResult);
vw.add(testDatabase);
vw.add(databaseResult);
vw.add(testFile);
vw.add(fileResult);
vw.add(progressBar);
progressBar.show();
win1.add(vw);
win1.open();
