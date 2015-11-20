var shop = '09A3C5B1-EBF7-443E-B620-48D3B648294E';
var apiKey = 'PELI09WG-RNL0-3B0R-A2GD-1GRL6XZ2GVQ8'
var apiKeyPower = 'BE12B369-0963-40AD-AA40-D68A7516A37B'

var fileCount = 0;
var fileProgress = {};
var fileName = '';
var allProgress = 0;
var chkClaim = false;
var claimInfo;
var sellNo = "";
$(function() {
	loadProvince();
	$('#txt-tel').ForceNumericOnly();
	$('#txt-zipcode').ForceNumericOnly();
	$(document).on('change', '#province', function(){
		loadDistrict();
	});

	$(document).on('change', '#district', function(){
		loadZipCode();
	});
	$("#btn-barcode").click(function(){
		if($('#txt-barcode').val() == ''){
			$('#txt-barcode').focus();
		}else{
			$('#customer_address .txt-input').each(function(){
				$(this).val("") 
			});
			loadZipCode();
			$('#claim_description').val('');
			$('#file1').val('');
			$('#file2').val('');
			$('#file3').val('');
			$('#file4').val('');
			warrantyInfo(); 
			$("#tab-warranty-not_exist").hide();
			$("#tab-warranty-info").hide();
			$('#dv-claim').hide();
			$('#form-success').hide();
			$('#dv-claim_info').hide();
			$('#dv-track').hide();
			$('#alert-trackno').hide();	
			$('#form-loading').hide();
			$("#tab-warranty-load").show();
		}
	});
	$("#txt-barcode").keyup(function(event){ 
		if(event.keyCode == 13){
			$("#btn-barcode").click();
		}
	});
	
	$("#txt-claimno").keyup(function(event){ 
		if(event.keyCode == 13){
			$("#btn-claimno").click();
		}
	});
	
	$("#txt-trackno").keyup(function(event){ 
		if(event.keyCode == 13){
			$("#btn-submit_trackno").click();
		}
	});
	
	$(document).submit(function(e){ // Disable Enter Key //
		return false;
	});
	
	$("#btn-submit_claiminfo").click(function(){
		submitClaim();
	});
	
	$("#btn-claimno").click(function(){
		if($('#txt-claimno').val() == ''){
			$('#txt-claimno').focus();
		}else{
			chkClaim = true;
			checkClaim();
			$("#tab-warranty-not_exist").hide();
			$("#tab-warranty-info").hide();
			$('#dv-claim').hide();
			$('#form-success').hide();
			$('#dv-claim_info').hide();
			$('#dv-track').hide();
			$('#alert-trackno').hide();	
			$("#tab-warranty-load").show(); 
		}
	}); 
	
	$("#btn-submit_trackno").click(function(){
		if($('#txt-trackno').val() == ''){
			$('#txt-trackno').focus();
		}else{
			$('#alert-trackno').hide();	
			var $obj = $(this);
			$obj.button('loading');
			submitCustomerTrack();
		}
	});
	
	$("#warrantyZoom").click(function(){
		$('#warrantyModal').modal();
	});

});
function warrantyInfo(chkBarcode){
	var barcode_info = ((typeof chkBarcode != 'undefined' && chkBarcode != '') ? $.trim(chkBarcode) : $.trim($('#txt-barcode').val()));
	$.post('http://api-test.powerdd.com/warranty/info', {
		apiKey: apiKeyPower,
		barcode: barcode_info
	}, function(data){
		if (data.success) {
			if (data.result.length != 0){
				if (chkClaim){
					claimInformation(data)						
				}else{
					$('#product').html(data.result.product);
					$('#barcode').html(data.result.barcode);
					$('#lastShop').html(data.result.shop);
					sellNo = data.result.sellNo;
					$('#tab-ProductName').html('<b>ชื่อสินค้า : </b>'+data.result.productName);
					$('#tab-Barcode').html('<b>หมายเลข Barcode : </b>'+data.result.barcode);
					var sellDateYearTH = parseInt(moment(data.result.sellDate).lang('th').format('YYYY'))+543;
					var sellDateMM = moment(data.result.sellDate).locale('th').format('DD MMMM'); 
					$('#tab-SellDate').html(sellDateMM+' '+sellDateYearTH);
					var expireDateYearTH = parseInt(moment(data.result.expireDate).lang('th').format('YYYY'))+543;
					var expireDateMM = moment(data.result.expireDate).locale('th').format('DD MMMM');
					if(data.result.warranty == 0){
						$('#tab-warrantyStatus').html('<b><u>สินค้าไม่มีประกัน</u><b>');
						$('#tab-warrantyStatus').removeClass('text-success');
						$('#tab-warrantyStatus').removeClass('text-danger');
						$('#tab-warrantyStatus').addClass('text-warning');
						$('#tab-ExpireDate').html('');
						$('#tab-warranty-info').removeClass('panel-success');
						$('#tab-warranty-info').removeClass('panel-danger');
						$('#tab-warranty-info').addClass('panel-warning');
					}
					else if(data.result.warranty > 0 && data.result.daysRemaining <= 0){					
						$('#tab-warrantyStatus').html('<b><u>หมดประกัน</u><b>');
						$('#tab-warrantyStatus').removeClass('text-success');
						$('#tab-warrantyStatus').removeClass('text-warning');
						$('#tab-warrantyStatus').addClass('text-danger');
						$('#tab-ExpireDate').html(expireDateMM+' '+expireDateYearTH);
						$('#tab-warranty-info').removeClass('panel-success');
						$('#tab-warranty-info').removeClass('panel-warning');
						$('#tab-warranty-info').addClass('panel-danger');
					}
					else{
						$('#tab-warrantyStatus').html('<b><u>อยู่ในประกัน</u><b>');
						$('#tab-warrantyStatus').removeClass('text-danger');
						$('#tab-warrantyStatus').removeClass('text-warning');
						$('#tab-warrantyStatus').addClass('text-success');							
						$('#tab-ExpireDate').html(expireDateMM+' '+expireDateYearTH);
						$('#tab-warranty-info').removeClass('panel-danger');
						$('#tab-warranty-info').removeClass('panel-warning');
						$('#tab-warranty-info').addClass('panel-success');
						
						$('#dv-claim').show();
					}
					$('#tab-warranty-info').show();					
					$("#tab-warranty-load").hide();
				}						
			}
			
		}else{
			$('#tab-warranty-not_exist').show();
			$("#tab-warranty-load").hide();
		}
		
	},'json').fail( function(xhr, textStatus, errorThrown) { console.log(xhr.statusText); });
};
function checkClaim(){
	$.post('http://api-test.powerdd.com/claim/info', {
		apiKey: apiKeyPower,
		shop: shop,
		id: $('#txt-claimno').val(),
		barcode: '',	
		claimdate_from: '',
		claimdate_to: '',	
		status: ''
	}, function(data){
			if (data.success) {
				claimInfo = data.result[0];
				warrantyInfo(data.result[0].barcode);			
			}else{

				$('#tab-warranty-not_exist').show();
				$("#tab-warranty-load").hide();
				
			}
	}, 'json').fail( function(xhr, textStatus, errorThrown) { console.log(xhr.statusText); });
};
function claimInformation(data){
	var claimStatus = '';
	if (claimInfo.status == 'CI') claimStatus = 'ตรวจสอบข้อมูล', $('#claim-ClaimStatus').removeClass(), $('#claim-ClaimStatus').addClass('text-danger');
	else if (claimInfo.status == 'AP') claimStatus = 'อยู่ในเงื่อนไขการเคลม', $('#claim-ClaimStatus').removeClass(), $('#claim-ClaimStatus').addClass('text-primary');
	else if (claimInfo.status == 'RJ') claimStatus = 'ไม่รับเคลมสินค้า', $('#claim-ClaimStatus').removeClass(), $('#claim-ClaimStatus').addClass('text-danger');
	else if (claimInfo.status == 'AM') claimStatus = 'กรุณาเพิ่มข้อมูลรายละเอียด', $('#claim-ClaimStatus').removeClass(), $('#claim-ClaimStatus').addClass('text-danger');
	else if (claimInfo.status == 'CP') claimStatus = 'สินค้าจัดส่งโดยลูกค้า', $('#claim-ClaimStatus').removeClass(), $('#claim-ClaimStatus').addClass('text-warning');
	else if (claimInfo.status == 'RP') claimStatus = 'ระบบได้รับสินค้าเคลมแล้ว', $('#claim-ClaimStatus').removeClass(), $('#claim-ClaimStatus').addClass('text-success');
	else if (claimInfo.status == 'SH') claimStatus = 'จัดส่งสินค้าเคลมให้ลูกค้า', $('#claim-ClaimStatus').removeClass(), $('#claim-ClaimStatus').addClass('text-success');
	else claimStatus = 'กรุณาติดต่อ ฝ่ายเคลม โทร 081- 828-8833 / 02-1567199 ';
							
	$('#claim-Massage').html('ข้อมูลล่าสุด ').addClass('text-success');
	$('#claim-Massage').hide();
	var YearTH = parseInt(moment(claimInfo.claimDate).lang('th').format('YYYY'))+543;
	var DateMM = moment(claimInfo.claimDate).locale('th').format('DD MMMM');
	$('#claim-ClaimDate').html('<font size="1"><b>วันที่ส่งข้อมูล : </b>'+ DateMM+' '+YearTH+'</font>');
	$('#claim-ClaimNo').html('<b>เลขที่การเคลม : </b>'+ claimInfo.claimNo);
	$('#claim-ClaimStatus').html('<b>สถานะ : </b>'+'<u>'+ claimStatus +'</u>');
	$('#claim-ProductName').html('<b>ชื่อสินค้า : </b>'+data.result.productName);
	$('#claim-Barcode').html('<b>หมายเลข Barcode : </b>'+data.result.barcode);
	$('#claim-Description').html('<b>รายละเอียด : </b>'+claimInfo.description);

	$('#sum-name').html('คุณ '+claimInfo.firstname+' '+claimInfo.lastname+(typeof claimInfo.nickname != 'undefined' && claimInfo.nickname != '' ? ' ('+claimInfo.nickname+')' : ''));
	$('#sum-address').html(claimInfo.address)
	$('#sum-address2').html(claimInfo.address2)
	$('#sum-location').html('แขวง/ตำบล'+claimInfo.subDistrict+' '+'เขต/อำเภอ'+claimInfo.district+' '+'จังหวัด'+claimInfo.province+' '+claimInfo.zipcode)
	if ( claimInfo.tel.length == 10 ) {
		var mobile = claimInfo.tel;
		$('#sum-tel').html('เบอร์โทร '+ mobile.substr(0, 3)+'-'+mobile.substr(3, 4)+'-'+mobile.substr(7, 3) );
	}else{$('#sum-tel').html('เบอร์โทร '+claimInfo.tel)}
	$('#sum-email').html(typeof claimInfo.email != 'undefined' && claimInfo.email != ''? 'อีเมล '+claimInfo.email : '')
	
	var modal = $('#dv-claim_info');
	var file = convertDataToArray('|', claimInfo.images);
	if (typeof file != 'undefined') {
		for(i=0; i<=3; i++) {
			modal.find('.img'+i+' img').attr('src', 'https://res.cloudinary.com/powerdd/image/upload/v1438076463/0875665456-1.jpg');
			modal.find('.img'+i+' a').attr('href', '#');
			if (typeof file[i] != 'undefined' && file[i] != '') {
				modal.find('.img'+i).show().find('img').attr('src', file[i]);
				modal.find('.img'+i).show().find('a').attr('href', file[i]);
			}
			else {
				modal.find('.img'+i).hide();
			}
		}
	}
	
	else {
		for(i=0; i<=3; i++) modal.find('.img'+i).hide();
	}
	
	$('#tab-warranty-load').hide();
	$('#dv-claim_info').show();
	if (claimInfo.status == 'AP') {
		$('#dv-track').show();
	}
	$('#btn-submit_trackno').button('default').html('ยืนยันข้อมูล');
	chkClaim = false;
};

function loadProvince(){
	$.post('http://power-api-test.azurewebsites.net/province/list', {
		apiKey: apiKey
	}, function(data){
			if (data.success) {
				var html = '';
				for( i=0; i<data.result.length; i++ ) {
					var result = data.result[i];
					html += '<option value="'+ result.ID +'"'+ 
						((result.Name == $('#province').attr('data-selected') || ($('#province').attr('data-selected') == '' && result.ID == '1')) ? ' selected' : '')
						+'>'+ result.Name +'</option>';
				}
				$('#province').html( html );
				loadDistrict()				
			}
	}, 'json').fail( function(xhr, textStatus, errorThrown) { console.log(xhr.statusText); });
};
function loadDistrict(){
	$.post('http://power-api-test.azurewebsites.net/province/district', {
		apiKey: apiKey,
		province: $('#province').val(),
	}, function(data){
			if (data.success) {
				var html = '';
				for( i=0; i<data.result.length; i++ ) {
					var result = data.result[i];
					html += '<option value="'+ result.ID +'" data-zipcode="'+ result.Zipcode +'"'+ 
						((result.ID == $('#district').attr('data-selected') && result.Zipcode == $('#district').attr('data-zipcode')) ? ' selected' : '')
						+'>'+ result.Name +'</option>';
				}
				$('#district').html( html );
					loadZipCode();			
			}
	}, 'json').fail( function(xhr, textStatus, errorThrown) { console.log(xhr.statusText); });
};
function loadZipCode(){
	$('#txt-zipcode').val( $('#district :selected').attr('data-zipcode') );
};

function uploadFile(){
	window.scrollTo(0 ,0);
	$('#dv-claim').hide();
	$('#tab-warranty-info').hide();
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
};

function upload(file, index){	
	var fd = new FormData();
	fd.append("file", file);
	fd.append("index", index);
	fd.append("mobile", $.trim($('#txt-tel').val()));
	fd.append("tags", 'claim,'+$.trim($('#txt-firstname').val())+','+$.trim($('#txt-lastname').val())+','+$('#province :selected').html()+','+$.trim($('#txt-tel').val()) );
	var xhr = new XMLHttpRequest();
	xhr.open('POST', 'https://powerupload.azurewebsites.net', true);

	xhr.upload.onprogress = function(e) {
		if (e.lengthComputable) {
			var percentComplete = (e.loaded / e.total) * 100;
			fileProgress[index] = percentComplete;
			allProgress = (fileProgress[1]+fileProgress[2]+fileProgress[3]+fileProgress[4])/fileCount;
			$('#progress').css('width', allProgress+'%').attr('aria-valuenow', allProgress);
		}
	};

	xhr.onload = function() {
		if (this.status == 200) {
			var json = JSON.parse(this.response);
			if ( json.success ) {
				fileName += json.filename + '|';
				if (allProgress == 100){
					addClaim();
				}
			}
		};
	};
	xhr.send(fd);
};

function submitClaim(){
	var isComplete = true;
	if ($('#claim_description').val() != '' &&  
		$('#file1').val() != '' || 
		$('#file2').val() != '' || 
		$('#file3').val() != '' ||
		$('#file4').val() != ''){
			$('#customer_address .txt-require').each(function(){
				$(this).val( $.trim($(this).val()) );
				if ( $(this).val() == '' ) {
					$(this).parents('.form-group').addClass('has-error');
					$(this).focus();
					isComplete = false;
					return false;
				}
				else {
					$(this).parents('.form-group').removeClass('has-error');
				}
			});

			if (isComplete) {
				uploadFile();
			}
	}else{
		$("#alert-claim_info").fadeIn();		
		setTimeout('$("#alert-claim_info").fadeOut()',3000);
		window.scrollTo(0, 0);
	}
};

function addClaim(){
	 
	$.post('http://api-test.powerdd.com/claim/add', {
		apiKey: apiKeyPower,
		shop: shop,
		from : 'W', // W is From Website
		barcode: $('#barcode').html(),
		product: $('#product').html(), 
		description: $('#claim_description').val(),
		firstname: $('#txt-firstname').val(),
		lastname: $('#txt-lastname').val(), 
		nickname: $('#txt-nickname').val(),
		address: $('#txt-address').val(),
		address2: $('#txt-address2').val(),
		province: $('#province :selected').html(),
		district: $('#district :selected').html(),
		subDistrict: $('#txt-sub_district').val(),
		zipcode: $('#txt-zipcode').val(),
		tel: $('#txt-tel').val(),
		email: $('#txt-email').val(), 
		images: fileName,
		lastShop: $('#lastShop').html(),
		sellNo: sellNo
	}, function(data){
			if (data.success) {
				$('#claim-Massage').html('กรุณานำเลขที่การเคลมอ้างอิงกับเจ้าหน้าที่เพื่อติดตามสถานะงานเคลมที่ Line ID: @remaxserive ค่ะ').addClass('text-success');
				$('#claim-ClaimNo').html('<b>เลขที่การเคลม: </b>'+ data.result[0].claimNo);
				//$('#claim-ClaimStatus').html('<b>สถานะ : </b>'+ (data.result[0].status == 'CI' ? ' <u>ตรวจสอบข้อมูล </u>' : '-')).addClass('text-danger');
				$('#claim-ProductName').html($('#tab-ProductName').html());
				$('#claim-Barcode').html($('#tab-Barcode').html());
				$('#claim-Description').html('<b>รายละเอียด : </b>'+$('#claim_description').val());

				$('#sum-name').html('คุณ '+$('#txt-firstname').val()+' '+$('#txt-lastname').val()+($('#txt-nickname').val() != '' ? ' ('+$('#txt-nickname').val()+')' : ''));
				$('#sum-address').html($('#txt-address').val())
				$('#sum-address2').html($('#txt-address2').val())
				$('#sum-location').html('แขวง/ตำบล'+$('#txt-sub_district').val()+' '+'เขต/อำเภอ'+$('#district :selected').html()+' '+'จังหวัด'+$('#province :selected').html()+' '+$('#txt-zipcode').val())
				if ( $('#txt-tel').val().length == 10 ) {
					var mobile = $('#txt-tel').val();
					$('#sum-tel').html('เบอร์โทร '+ mobile.substr(0, 3)+'-'+mobile.substr(3, 4)+'-'+mobile.substr(7, 3) );
				}else{$('#sum-tel').html('เบอร์โทร '+$('#txt-tel').val())}
				$('#sum-email').html($('#txt-email').val() != '' ? 'อีเมล '+$('#txt-email').val() : '')
				
				var modal = $('#dv-claim_info');
				var file = convertDataToArray('|', fileName);
				if (typeof file != 'undefined') {
					for(i=0; i<=3; i++) {
						modal.find('.img'+i+' img').attr('src', 'https://res.cloudinary.com/powerdd/image/upload/v1438076463/0875665456-1.jpg');
						modal.find('.img'+i+' a').attr('href', '#');
						if (typeof file[i] != 'undefined' && file[i] != '') {
							modal.find('.img'+i).show().find('img').attr('src', file[i]);
							modal.find('.img'+i).show().find('a').attr('href', file[i]);
						}
						else {
							modal.find('.img'+i).hide();
						}
					}
				}
				else {
					for(i=0; i<=3; i++) modal.find('.img'+i).hide();
				}
				
				$('#form-loading').hide();
				$('#dv-claim_info').show();
				$('#dv-track').show();
				
			}
	}, 'json').fail( function(xhr, textStatus, errorThrown) { console.log(xhr.statusText); });
};

function submitCustomerTrack(){
	$.post('http://api-test.powerdd.com/claim/update', {
		apiKey: apiKeyPower,
		shop: shop,
		id: $('#txt-claimno').val(),
		column: "customerTrackNo,status,updateBy",
		value: $("#txt-trackno").val()+","+"CP"+","+claimInfo.firstname
	}, function(data){
			if (data.success) {
				$('#dv-claim_info').hide();
				$('#dv-track').hide();
				$('#alert-trackno').show();
				window.scrollTo(0, 0);				
			}
	}, 'json').fail( function(xhr, textStatus, errorThrown) { console.log(xhr.statusText); });
};

function convertDataToArray(sign, data) {
	if (data == null) {
		var arr = [];
		return arr;
	}
	else if ( data.indexOf(sign) != -1) {
		var sp = data.split(sign);
		for(i=0; i<sp.length; i++) sp[i] = sp[i].trim();
		return sp;
	}
	else {
		var arr = [data];
		return arr;
	}
};