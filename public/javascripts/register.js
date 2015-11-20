var fileCount = 0;
var fileProgress = {};
var fileName = '';
var allProgress = 0;

$(function() {

	$('#mobile').ForceNumericOnly();
	loadProvince();
	//renderTime();

	$(document).on('click', '#btn-register', function(evt){
		if( checkInput() ) {
			uploadFile();
		}
	});

});

function loadProvince(){	
	$.post('https://24fin-api.azurewebsites.net/master/thailand/province', {
		apiKey: $('#api_key').val(),
	}, function(data){
		if(data.success) {
			$('#province').html('');
			var html = '';
			for(i=0; i<data.result.length; i++){
				html += '<option>'+data.result[i].name+'</option>';
			}
			$('#province').html(html);
			$('#province option:eq(1)').attr('selected', 'selected');
		}
	});
}

function renderTime(){	
	$('#time').html('');
	var html = '';
	for(i=6; i<=22; i++){
		html += "<option>"+((i<10) ? '0' : '')+i+":00-"+((i<9) ? '0' : '')+(i+1)+":00</option>";
	}
	$('#time').html(html);
}

function checkInput() {
	var success = true;
	$('.form-group.has-error').removeClass('has-error');
	$('input.required').each(function(){
		if( $.trim($(this).val()) == "" ){
			success = false;
			$(this).parents('.form-group').addClass('has-error');
			$(this).focus();
			$('html, body').animate({scrollTop: $(this).parents('.form-group').offset().top-60}, 200);
			return false;
		}
	});

	if(success){
		if( $.trim($('#mobile').val()).length < 9 || $.trim($('#mobile').val()).substr(0,1) != '0' ){
			success = false;
			$('#mobile').parents('.form-group').addClass('has-error');
			$('#mobile').focus();
			$('html, body').animate({scrollTop: $('#mobile').parents('.form-group').offset().top-60}, 200);
		}
	}

	return success;
}

function uploadFile(){
	
	$('#form-input').slideUp();
	$('#form-loading').fadeIn();

	fileCount = 0;
	allProgress = 0;
	fileName = '';
	for(i=1; i<=4; i++) {
		fileProgress[i] = 0;
		if (typeof document.getElementById('file'+i).files[0] != 'undefined') {
			upload(document.getElementById('file'+i).files[0], i);
			fileCount++;
		}
	}

	if ( fileCount == 0 ) register();
}

function upload(file, index){	
	var fd = new FormData();
	fd.append("file", file);
	fd.append("index", index);
	fd.append("mobile", $.trim($('#mobile').val()));
	fd.append("tags", 'dealer,'+$.trim($('#firstname').val())+','+$.trim($('#lastname').val())+','+$('#province :selected').val()+','+$.trim($('#mobile').val()) );
	var xhr = new XMLHttpRequest();
	xhr.open('POST', 'https://powerupload.azurewebsites.net', true);

	xhr.upload.onprogress = function(e) {
		if (e.lengthComputable) {
			var percentComplete = (e.loaded / e.total) * 100;
			fileProgress[index] = percentComplete;
			allProgress = (fileProgress[1]+fileProgress[2]+fileProgress[3]+fileProgress[4])/fileCount;
			$('#progress').css('width', allProgress+'%').attr('aria-valuenow', allProgress);
			//console.log(percentComplete + '% uploaded -> total = ' + (allProgress/fileCount) );
		}
	};

	xhr.onload = function() {
		if (this.status == 200) {
			var json = JSON.parse(this.response);
			if ( json.success ) {
				fileName += json.filename + '|';
				if (allProgress == 100){
					register();
				}
			}
		};
	};
	xhr.send(fd);
}

function register(){
	var json = {};
	json.Firstname = $.trim($('#firstname').val());
	json.Lastname = $.trim($('#lastname').val());
	json.Nickname = $.trim($('#nickname').val());
	json.Province = $('#province :selected').val();
	json.Phone = $.trim($('#mobile').val());
	json.TimeToContact = $('#time :selected').val();
	json.Address = $.trim($('#address').val());
	json.Profile = $.trim($('#history').val());
	json.Reason = $.trim($('#reason').val());
	json.Expect = $.trim($('#expect').val());
	json.Comment = $.trim($('#comment').val());
	if ( fileName != '' ) json.PictureUrl = fileName;
	$.post('http://power-api-test.azurewebsites.net/dealer/register', {
		apiKey: 'PELI09WG-RNL0-3B0R-A2GD-1GRL6XZ2GVQ8',
		value: JSON.stringify(json),
	}, function(data){
		if(data.success) {
			$('#form-loading').slideUp();
			$('#form-success').slideDown();
		}
	});
}