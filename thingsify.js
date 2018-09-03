/**

Todo list being processed should be in the format:

* Some List | This is the Todo's Title - start date - deadline date
Notes can be here, but should all be on one line.
+ checklist items
+ are formatted like so
- tag1 tag2 tag3

* Another List | This is the second todo - start date
* List | This is the Third Todo - start date

**/


function processLines (lines) {
	/**
	Takes a list of strings, returns a list of objects representing todos.

	{title: '...'; date: '01/23/18'; etc...}

	This doesn't check for or recover from improperly formatted todos; it will
	just fail in a weird way.
	**/
	var todos = [];
	var todo = {}; 
	for (var line of lines) {
		if (line[0] == "*") {
			// Then we're in a new Todo
			line = line.substring(1).trim();

			// Push the last todo, if there is one (all todos have a title)
			if (todo.title)  todos.push(todo);

			var list, title, date, deadline;

			if (line.includes('|')) { 
				[list, line] = line.split(' | '); 
			}
			if (line.includes('-'))  {
				[title, date, deadline] = line.split(' - ');
			} else {
				title = line;
			}

			todo = {list, title, date, deadline};
		} else if (line[0] == "+") {
			// Then we're in a checklist
			if (todo.checklist == undefined)  todo.checklist = [];
			todo.checklist.push(line.substring(1).trim())
		} else if (line[0] == "-") {
			// Then we're adding tags
			todo.tags = line.substring(1).trim().split(' ');
		} else if (line[0]) {
			// Then we're adding a note
			if (!todo.notes)  todo.notes = [];
			todo.notes.push(line);
		}
	}
	// Ensure that the last todo processed is also included 
	if (todo)  todos.push(todo);

	return todos;
}

function createThingsTodo(o) {
	var todo = TJSTodo.create();
	todo.title = o.title;
	todo.list = o.list;
	if (o.deadline) todo.deadline = o.deadline;
	if (o.when)  todo.when = o.when;
	if (o.tags)  todo.tags = o.tags;
	if (o.notes)  todo.notes = o.notes.join('\n');
    if (o.checklist) {
    	for (var item of o.checklist) {
    		var i = TJSChecklistItem.create();
    		i.title = item;
    		todo.addChecklistItem(i);
    	}
    }
	return todo;		
}

function sendToThings(todos) {
	const container = TJSContainer.create(todos);
	var cb = CallbackURL.create();
	cb.baseURL = container.url;

	if (cb.open()) {
		console.log(todos.length.toString() + " todos created in Things");
	} else {
		console.fail();
	}
}

function main(draft) {
	var lines = draft.content.split("\n");

	var todos = processLines(lines);
	var thingsTodos = [];
	for (var todo of todos) {
		thingsTodos.push(createThingsTodo(todo));
	}
	sendToThings(thingsTodos);
}

main(draft);
