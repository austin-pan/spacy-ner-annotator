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
function l(message){
	console.log(message);
}
function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
function myFunction(){
	setTimeout(function() {
		$("#editor").html($("#editor").text());
	}, 0);
	// alert();
}
function getCorrectedText(){
	if($(".gsc-results.gsc-webResult").children().length > 3){
		corrected_text = $(".gs-spelling a").first().text();
		l(corrected_text)
	}
}
function getFilename(myFile){
	if(myFile.files.length > 0){
		var file = myFile.files[0];  
	   	var filename = file.name;
	   	$(".custom-file-label").text(filename);
	   	l(filename);
   }
   else{
   		$(".custom-file-label").text('Choose file...');
   }
}
function onPaste(e){
  e.preventDefault();

  if( e.clipboardData ){
    full_text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, full_text);
    l(full_text);
    return false;
  }
  else if( window.clipboardData ){
    full_text = window.clipboardData.getData('Text');
    l(full_text);
    if (window.getSelection)
      window.getSelection().getRangeAt(0).insertNode( document.createTextNode(full_text) );
  }
}
// document.querySelector('[contenteditable]').addEventListener('paste', onPaste);
function setEntityOutput(value,color){
	l(value,color);
	$("#entity").append('<div class="entityval"><div style="background-color:'+color+'">'+value+'</div></div>');
}
function clearSelection()
{
 if (window.getSelection) {window.getSelection().removeAllRanges();}
 else if (document.selection) {document.selection.empty();}
}
function commit() {
	full_text = $("#editor").text();
	if(full_text != $("#gsc-i-id1").val()){
		$("#gsc-i-id1.gsc-input").val(full_text);
	    $(".gsc-search-button").click();
	}
	$("#editor").attr('contenteditable',false);
}
function addClass(classname) {
	class_names.push(classname);
	$(".classes").append('<div class="row pdn"><div class="col-9"><button class="class" style="background-color:'+getRandomColor()+'"><span>'+classname+'</span></button></div><div class="col-3"><button class="btn pull-right delete_btn"><i class="fa fa-trash"></i></button></div></div>');
}

$(document).ready(function(){
	l('ok');
	$("#edit").hide();
	$('textarea').attr('readonly',false);
	$("#fileUpload").click()

	$("#editor").attr('contenteditable',false);

	addClass("PERSON");
	addClass("ORGANIZATION");

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
$("#save").click(function(){
	commit();
	$("#save").hide();
	$("#edit").show();
});
$("#edit").click(function(){
	$("#editor").attr('contenteditable',true);
	$("#edit").hide();
	$("#save").show();
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
$("input").keypress(function(e){
	var key = e.which;
	if(key == 13){
		$("#addclass").click();
		return false;  
	}
});
$( ".classes" ).on("click",".class",function(){
	commit();

	entity = [];
	/*if($("#editor").attr('contenteditable') == 'true'){
		alert("Please save the content");
		return;
	}*/
	/*$("span").each(function(index) {
	    var text = $(this).text();//get span content
	    $(this).replaceWith(text);//replace all span with just content
	});*/
	selection = window.getSelection();
	selected_text = selection.toString();
	if(selected_text == ""){
		alert("Please select atleast one entity");
		return;
	}
	//$("span").hide();
    range = selection.getRangeAt(0);
    priorRange = range.cloneRange();
    priorRange.selectNodeContents(document.getElementById("editor"));
    priorRange.setEnd(range.startContainer, range.startOffset);
    start = priorRange.toString().length;
    end = start + (selection + '').length;
    //$("span").show();
    if (start > end) {
    	t = start;
    	start = end;
    	end = t;
    }
	if(start < 0 || end < 0){
		alert("Please select entity inside the content");
		return;
	}
	l("selected_text: " + selected_text);
	l("idx: " + start + " " + end);
	l("anchorNode: " + selection.anchorNode.nodeName);
	entities.push([start, end, $(this).text()]);
	// alert(window.getSelection().toString());

	l("this: " + $(this).text());
	color_rgb = $(this).css('background-color');
	$("#editor").attr('contenteditable',true);
	/*if (selection.rangeCount && selection.getRangeAt) {
	    range = selection.getRangeAt(0);
	}*/
	// Set design mode to on
	document.designMode = "on";
	if (range) {
	  selection.removeAllRanges();
	  selection.addRange(range);
	}
	// Colorize text
	document.execCommand("BackColor", false, color_rgb);
	// Set design mode to off
	document.designMode = "off";

	meta_text = selected_text + " " + start + " " + end;
	entities_values.push(meta_text);
	entities_values.push(color_rgb);
	setEntityOutput(meta_text, color_rgb);
	selected_text = "";
	$("#editor").attr('contenteditable',false);
	clearSelection();
});
$( "#entity" ).on("dblclick",".entityval",function(){
	text = $(this).text();
	texts = text.split(" ");
	// var delete_text = $(this).text();
	delete_text = texts[0];
	en_del_idx = parseInt(texts[1]);
	en_len_cnt = parseInt(texts[2]);
	console.log(entities_values);
	console.log(text);
	var e_v_idx = entities_values.indexOf(text);

	/*range = document.createRange();
	range.selectNodeContents(document.getElementById("#editor"));
	console.log(range.toString());
	console.log(range.startContainer.childNodes);
	for (var i = 0; i < range.startContainer.childNodes.length; i++) {
		console.log(range.startContainer.childNodes[i].offsetLeft);
	}
	//range.setStart(range.startContainer.childNodes[0], 0);
	//range.setEnd(range.startContainer.childNodes[0], 1);
	console.log(range.toString());*/

	var color_txt = entities_values[e_v_idx + 1];
	//var pre = $("#editor").html().substring(0, en_del_idx);
	var tag_string = '<span style="background-color: ' + color_txt + ';">' + delete_text + '</span>';
	//console.log(pre + tag_string);
	//console.log($("#editor").html());
	replace_html = $("#editor").html().replace(tag_string, delete_text);
	//console.log(replace_html);
	$("#editor").html(replace_html);
	entities_values.splice(e_v_idx, 1);
	entities_values.splice(e_v_idx, 1);
	// en_del_idx = full_text.indexOf(delete_text);
	// en_len_cnt = en_del_idx+delete_text.length;
	del_idx = -1;
	$.each(entities,function(idx,val){
		if((en_del_idx == val[0]) && (en_len_cnt == val[1])){
			del_idx = idx;
		}
	});
	if(del_idx != -1){
		entities.splice(del_idx,1);
	}
	// l(en_del_idx,en_len_cnt,delete_text,color_txt,tag_string); 
	$(this).remove();
});

$("#prev").click(function(){
	if (page_num > 0) {
		page_num--;
		$("#doctext").text(">>> " + text_file_all_text.slice(page_num, text_file_all_text.length).join("\n\n"));
		$("#doccount").text(text_file_all_text.length - page_num)
		$('#editor').text(text_file_all_text[page_num]);
		$("#gsc-i-id1.gsc-input").val(text_file_all_text[page_num]);
		$(".gsc-search-button").click();
		// $("#save").show();
		// $("#edit").hide();
		$("#entity").empty();
		entities = [];
		full_text = "";

		training_datas.pop()
	} else {
		alert("Already at Beginning");
	}
});

$("#next").click(function(){
	page_num++;
	$("#doctext").text(">>> " + text_file_all_text.slice(page_num, text_file_all_text.length).join("\n\n"));
	$("#doccount").text(text_file_all_text.length - page_num)

	if(entities.length == 0 & page_num < text_file_all_text.length){
		// skip
		// alert("Please select atleast one entity");
		
		$('#editor').text(text_file_all_text[page_num]);
		$("#gsc-i-id1.gsc-input").val(text_file_all_text[page_num]);
		$(".gsc-search-button").click();
		return;
	}

	// $("#editor").text("");
	// $("#editor").attr('contenteditable',true);
	// $("#save").show();
	// $("#edit").hide();
	$("#entity").empty();
	if(page_num < text_file_all_text.length){
		training_data = {};
		training_data['content'] = full_text;
		training_data['entities'] = entities;
		training_datas.push(training_data);

		entities = [];
		full_text = "";
		
		$('#editor').text(text_file_all_text[page_num]);
		$("#gsc-i-id1.gsc-input").val(text_file_all_text[page_num]);
		$(".gsc-search-button").click();
	} else {
		page_num--;
		alert("Reached End of File");
	}
});
$("#complete").click(function(){
	training_data = {};
	training_data['content'] = full_text;
	training_data['entities'] = entities;
	if (full_text != "") {
		training_datas.push(training_data);
	}
	if ('Blob' in window) {
		var fileName = prompt('Please enter file name to save with(.json)', 'Untitled.json');
		if(fileName != null){
			l(fileName);
			var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(training_datas));
			var dlAnchorElem = document.createElement('a');
			dlAnchorElem.setAttribute("href",     dataStr     );
			dlAnchorElem.setAttribute("download", fileName);
			dlAnchorElem.click();
			training_datas = []
			page_num = 0;
			entities = [];
			full_text = "";
			// $("#editor").text("");
			// $("#editor").attr('contenteditable',true);
			// $("#save").show();
			// $("#edit").hide();
			$("#entity").empty();
		}
	}
	else{
		alert('Your browser does not support the HTML5 Blob.');
	}
	
});
$( ".classes" ).on("click",".delete_btn",function(){
	if(confirm("Are you sure want to delete entity name?")){
		l('deleted');
		tt = $('.delete_btn').parent().parent().text();
		class_names.splice(class_names.indexOf(tt),1);
		$(this).parent().parent().remove();
	}
});
$("#upload").click(function(){
	l('upload clicked');
	var fileInput = $('#validatedCustomFile');
	var input = fileInput.get(0);
	if(input.files.length > 0){
		var textFile = input.files[0];
		var reader = new FileReader();
		reader.onload = function(e) {
		   // The file's text will be printed here
		    text_file_all_text = e.target.result.split('\n');
		    $('#editor').text(text_file_all_text[page_num]);
	    	$("#gsc-i-id1.gsc-input").val(text_file_all_text[page_num]);
	    	$(".gsc-search-button").click();
	    	$("#doctext").text(">>> " + text_file_all_text.join("\n\n"));
	    	$("#doccount").text(text_file_all_text.length);
		};
		reader.readAsText(textFile);
	}
});