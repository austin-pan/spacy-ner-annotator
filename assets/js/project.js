var full_text_array = []
var full_text = "";
var text_file_all_text = [];
var page_num = 0;
var selected_text = "";
var training_datas = [];
var training_data = {};
var entities = [];
var entities_values = [];
var class_names = []


function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}


function getFilename(myFile) {
	if(myFile.files.length > 0){
		var file = myFile.files[0];  
	   	var filename = file.name;
	   	$(".custom-file-label").text(filename);
	   	console.log(filename);
   }
   else{
   		$(".custom-file-label").text('Choose file...');
   }
}


function clearSelection() {
 if (window.getSelection) {
 	window.getSelection().removeAllRanges();
 } else if (document.selection) {
 	document.selection.empty();
 }
}


function commit() {
	full_text = $("#editor").text();
}


function addClass(classname) {
	class_names.push(classname);
	$(".classes").append('<div class="row pdn"><div class="col-9"><button class="class" style="background-color:'+getRandomColor()+'"><span>'+classname+'</span></button></div><div class="col-3"><button class="btn pull-right delete_btn"><i class="fa fa-trash"></i></button></div></div>');
}


function arrayEquals(a1, a2) {
	if (a1.length != a2.length) {
		return false;
	}

	for (var i = 0; i < a1.length; i++) {
		if (a1[i] != a2[i]) {
			return false;
		}
	}

	return true;
}


function arrayIndexOf(objArr, arr) {
	index = 0;
	for (index = 0; index < arr.length; index++) {
		if (arrayEquals(arr[index], objArr)) {
			break;
		}
	}

	if (index >= arr.length) {
		return -1;
	}

	return index;
}


function updateText() {
	$("#doctext").text(">>> " + text_file_all_text.slice(page_num, text_file_all_text.length).join("\n\n"));
	$("#doccount").text(text_file_all_text.length - 1 - page_num)
	$('#editor').text(text_file_all_text[page_num]);
}



$(document).ready(function(){
	console.log('ok');
	$('textarea').attr('readonly',false);
	$("#fileUpload").click()

	addClass("PERSON");
	addClass("ORG");

	// var cx = '011558942542564350974:nldba-ydc7g'; // Insert your own Custom Search engine ID here
	// var gcse = document.createElement('script');
	// gcse.type = 'text/javascript';
	// gcse.async = true;
	// gcse.src = 'https://cse.google.com/cse.js?cx=' + cx;
	// var s = document.getElementsByTagName('script')[0];
	// s.parentNode.insertBefore(gcse, s);


	// var inputText = prompt('Please enter the training dataset(filename.txt)');
	// l("MANI"+inputText+"vannan");
	// if((inputText != null) && (inputText.length > 0)){
	// 	l(inputText);
	// 	var rawFile = new XMLHttpRequest();
	//     rawFile.open("GET", inputText, false);
	//     rawFile.onreadystatechange = function ()
	//     {
	//         if(rawFile.readyState === 4)
	//         {
	//             if(rawFile.status === 200 || rawFile.status == 0)
	//             {
	//                 text_file_all_text = rawFile.responseText.split('\n');
	//                 l('success');
	//     			l(text_file_all_text);
	//     			$('#editor').text(text_file_all_text[page_num]);
	//     			setTimeout(function(){ 
	//     				$("#gsc-i-id1.gsc-input").val(text_file_all_text[page_num]);
	//     				$(".gsc-search-button").click();
	//     			}, 500);
	//     			// $("#gsc-i-id1.gsc-input").val(text_file_all_text[page_num]);
	//             }
	//             else{
	//             	alert(inputText+" doest not exist");
	//             }
	//         }
	//     }
	//     rawFile.send(null);
	// }
});


$("#addclass").click(function(){
	classname = $('input').val();
	if(class_names.indexOf(classname) != -1){
		alert("Class names is already saved");
		$('input').val("");
		return;
	}

	addClass(classname);

	$('input').val("");
});


$("input").keypress(function(e) {
	var key = e.which;
	if (key == 13) {
		$("#addclass").click();
		return false;  
	}
});


$(".classes").on("click", ".class", function(){
	commit();

	selection = window.getSelection();
	selected_text = selection.toString();
	if(selected_text == "") {
		alert("Please select an entity to label");
		return;
	}

    range = selection.getRangeAt(0);
    priorRange = range.cloneRange();
    priorRange.selectNodeContents(document.getElementById("editor"));
    priorRange.setEnd(range.startContainer, range.startOffset);
    start = priorRange.toString().length;
    end = start + (selection + '').length;
	if(start < 0 || end < 0) {
		alert("Please select entity inside the content");
		return;
	}

	for (var i = 0; i < entities.length; i++) {
		ent = entities[i];
		if ((start >= ent[0] && start < ent[1]) || (end > ent[0] && end <= ent[1])) {
			clearSelection();
			alert("Overlapping annotations");
			return;
		}
	}

	entity = [start, end, $(this).text()]
	entities.push(entity);

	color_rgb = $(this).css('background-color');
	tag = document.createElement("span");
	tag.setAttribute("start_idx", start);
	tag.setAttribute("end_idx", end);
	tag.setAttribute("class", "annotation");
	tag.setAttribute("annotation", $(this).text());
	tag.setAttribute("style", "background-color: " + color_rgb + ";");

	range.surroundContents(tag);

	clearSelection();

	console.log("+ added: " + entity);
});


$("#editor").on("click", ".annotation", function() {
	annotation = $(this);
	start = parseInt(annotation.attr("start_idx"));
	end = parseInt(annotation.attr("end_idx"));
	label = annotation.attr("annotation");

	$(this).contents().unwrap();
	entity = [start, end, label];

	index = arrayIndexOf(entity, entities);
	if (index > -1) {
	  entities.splice(index, 1);
	}

	console.log("- removed: " + entity);
})


$("#prev").click(function() {
	if (page_num > 0) {
		page_num--;
		updateText();

		entities = [];
		full_text = "";

		p = training_datas.pop()

		console.log(">>> going back, dropped " + p['entities'].length + " annotation(s)")
	} else {
		alert("Already at Beginning");
	}
});


$("#next").click(function() {
	page_num++;
	updateText();

	if (page_num < text_file_all_text.length - 1) {
		training_data = {};
		training_data['content'] = full_text;
		training_data['entities'] = entities;

		training_datas.push(training_data);

		entities = [];
		full_text = "";

		console.log(">>> saved " + entities.length + " annotation(s)")
	} else {
		page_num--;
		alert("Reached End of File");
	}
});


$("#complete").click(function() {
	if (entities.length > 0 && full_text != "") {
		training_data = {};
		training_data['content'] = full_text;
		training_data['entities'] = entities;
	
		training_datas.push(training_data);
	}

	if ('Blob' in window) {
		var fileName = prompt('Please enter file name to save with(.json)', 'Untitled.json');
		if(fileName != null){
			console.log(fileName);
			var jsonText = JSON.stringify(training_datas);
			var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(jsonText);
			var dlAnchorElem = document.createElement('a');
			dlAnchorElem.setAttribute("href", dataStr);
			dlAnchorElem.setAttribute("download", fileName);
			dlAnchorElem.click();
			training_datas = []
			page_num = 0;

			entities = [];
			full_text = "";
		}
	} else {
		alert('Your browser does not support the HTML5 Blob.');
	}
	
});


$(".classes").on("click", ".delete_btn", function() {
	if (confirm("Are you sure want to delete entity name?")) {
		console.log('deleted');
		tt = $('.delete_btn').parent().parent().text();
		class_names.splice(class_names.indexOf(tt),1);
		$(this).parent().parent().remove();
	}
});


$("#upload").click(function() {
	console.log('upload clicked');
	var fileInput = $('#validatedCustomFile');
	var input = fileInput.get(0);
	if (input.files.length > 0) {
		var textFile = input.files[0];
		var reader = new FileReader();
		reader.onload = function(e) {
			// The file's text will be printed here
		    text_file_all_text = e.target.result.split('\n');
		    $('#editor').text(text_file_all_text[page_num]);

	    	page_num = 0;
	    	updateText();
		};
		reader.readAsText(textFile);
	}
});