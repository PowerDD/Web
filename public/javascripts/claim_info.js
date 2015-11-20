//var shop = '09A3C5B1-EBF7-443E-B620-48D3B648294E';
var shop = 'POWERDDH-8888-8888-B620-48D3B6489999';
var apiKey = 'PELI09WG-RNL0-3B0R-A2GD-1GRL6XZ2GVQ8';
var apiKeyPower = 'BE12B369-0963-40AD-AA40-D68A7516A37B';
var apiKey24 = '91ADEBD2-1A72-4616-B8C7-8659A3618197';
//var apiUrl = 'https://api-test.powerdd.com';
var apiUrl = 'https://api.powerdd.com';

var fileCount = 0;
var fileProgress = {};
var fileName = '';
var allProgress = 0;
var chkClaim = false;
var loadAdressComplete = false;
var claimInfo;
var claimNo = "";
var sellDate = "";
var sellNo = "";
var sellPrice = 0;
var _username = "";

$(function() {
	$('#hTitle').html('ส่งข้อมูลสินค้าเคลม');
	$('#tab-warranty-load').show();
	checkUser();
	$('#btn-login').removeClass('disabled');
	$('#username, #password').removeAttr('disabled');

	$(document).on('click', '#btn-login', function(){
		if ( !$(this).hasClass('disabled') ) {
			$('#message').show();
			if ( $.trim($('#username').val()) == '' ) {
				$('#message').html( '<i class="fa fa-warning"></i> กรุณากรอกชื่อผู้ใช้ด้วยค่ะ' ).addClass('text-danger').removeClass('text-primary');
			}
			else if ( $('#password').val() == '' ) {
				$('#message').html( '<i class="fa fa-warning"></i> กรุณากรอกรหัสผ่านด้วยค่ะ' ).addClass('text-danger').removeClass('text-primary');
			}
			else {
				$('#message').html( '<i class="fa fa-spinner fa-pulse"></i> กำลังตรวจสอบข้อมูล กรุณารอสักครู่ค่ะ' ).addClass('text-primary').removeClass('text-danger');
				$('#btn-login').addClass('disabled');
				$('#username, #password').attr('disabled', 'disabled');
				login();
			}
		}
	});

	$(document).on('keydown', '#username, #password', function(e){
		var key = e.charCode || e.keyCode || 0;
		if (key == 13) {
			$('#btn-login').click();
		}
	});
	
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
			
			$('#alert-barcode_exist').hide();
			$("#tab-warranty-not_exist").hide();
			$("#tab-warranty-info").hide();
			$('#dv-claim').hide();
			$('#form-success').hide();
			$('#dv-claim_info').hide();
			//$('#dv-track').hide();
			$('#alert-trackno').hide();	
			$('#form-loading').hide();
			$("#tab-warranty-load").show();
			
			$('#tabbarcode').hide();
			barcodeExist();
		}
	});
	$("#txt-barcode").keyup(function(event){ 
		if(event.keyCode == 13){
			$("#btn-barcode").click();
		}
	});
	
	
	$(document).submit(function(e){ // Disable Enter Key //
		return false;
	});
	
	$("#btn-submit_claiminfo").click(function(){
		$('#imgClaim_2').hide();
		submitClaim();
	});
		
	$("#btn-claim_next").click(function(){
		$('#claimNo3').html('<b>เลขที่การเคลม</b><h3 class="text-danger">'+ claimNo +'</h3>');
		$('#dv-lineat').show();
		$('#dv-claim_info').hide();
	});
	
	$("#btn-done").click(function(){
		$('#dv-lineat').hide();
		$('#dv-done').show();
	});
	
	$("#btn-logout_claim").click(function(){
		logout();
	});
});


function warrantyInfo(chkBarcode){	
	loadAdress();
	var barcode_info = ((typeof chkBarcode != 'undefined' && chkBarcode != '') ? $.trim(chkBarcode) : $.trim($('#txt-barcode').val()));
	$.post(apiUrl+'/warranty/info', {
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
					sellPrice = data.result.sellPrice;
					sellDate = moment(data.result.sellDate).lang('en').format('MM/DD/YYYY');

					$('#tab-ProductName').html('<b>ชื่อสินค้า : </b>'+data.result.productName);
					$('#tab-Barcode').html('<b>หมายเลข Barcode : </b>'+data.result.barcode);
					var sellDateYearTH = parseInt(moment(data.result.sellDate).lang('th').format('YYYY'))+543;
					var sellDateMM = moment(data.result.sellDate).locale('th').format('MMMM'); 
					//$('#tab-SellDate').html(sellDateMM+' '+sellDateYearTH);
					var expireDateYearTH = parseInt(moment(data.result.expireDate).lang('th').format('YYYY'))+543;
					var expireDateMM = moment(data.result.expireDate).locale('th').format('MMMM');
					if(data.result.warranty == 0){
						$('#tab-warrantyStatus').html('<b>สถานะ : </b><b><u>สินค้าไม่มีประกัน</u><b>');
						$('#tab-warrantyStatus').removeClass('text-success');
						$('#tab-warrantyStatus').removeClass('text-danger');
						$('#tab-warrantyStatus').addClass('text-warning');
						//$('#tab-ExpireDate').html('');
						$('#tab-warranty-info').removeClass('panel-success');
						$('#tab-warranty-info').removeClass('panel-danger');
						$('#tab-warranty-info').addClass('panel-warning');
						
						$('#tabbarcode').show();
					}
					else if(data.result.warranty > 0 && data.result.daysRemaining <= 0){					
						$('#tab-warrantyStatus').html('<b>สถานะ : </b><b><u>หมดประกัน</u><b>');
						$('#tab-warrantyStatus').removeClass('text-success');
						$('#tab-warrantyStatus').removeClass('text-warning');
						$('#tab-warrantyStatus').addClass('text-danger');
						//$('#tab-ExpireDate').html(expireDateMM+' '+expireDateYearTH);
						$('#tab-warranty-info').removeClass('panel-success');
						$('#tab-warranty-info').removeClass('panel-warning');
						$('#tab-warranty-info').addClass('panel-danger');
						
						$('#tabbarcode').show();
					}
					else{
						if(loadAdressComplete){
							$('#tab-warrantyStatus').html('<b>สถานะ : </b><b><u>อยู่ในประกัน</u><b>');
							$('#tab-warrantyStatus').removeClass('text-danger');
							$('#tab-warrantyStatus').removeClass('text-warning');
							$('#tab-warrantyStatus').addClass('text-success');							
							//$('#tab-ExpireDate').html(expireDateMM+' '+expireDateYearTH);
							$('#tab-warranty-info').removeClass('panel-danger');
							$('#tab-warranty-info').removeClass('panel-warning');
							$('#tab-warranty-info').addClass('panel-success');
							
							$('#dv-claim').show();
							$('#imgClaim_2').show();						

						}else{loadAdress();}
						
					}
					$('#tab-warranty-info').show();					
					$("#tab-warranty-load").hide();
					$('#claimModal').animate({ scrollTop: 0 }, 'fast');
				}						
			}
			
		}else{
			$('#tab-warranty-not_exist').show();
			$('#tabbarcode').show();
			$("#tab-warranty-load").hide();
		}
		
	},'json').fail( function(xhr, textStatus, errorThrown) { console.log(xhr.statusText); });
};


function loadProvince(){
	$.post(apiUrl+'/province/list', {
		apiKey: apiKeyPower
	}, function(data){
			if (data.success) {
				var html = '';
				for( i=0; i<data.result.length; i++ ) {
					var result = data.result[i];
					html += '<option value="'+ result.id +'"'+ 
						((result.name == $('#province').attr('data-selected') || ($('#province').attr('data-selected') == '' && result.id == '1')) ? ' selected' : '')
						+'>'+ result.name +'</option>';
				}
				$('#province').html( html );
				loadDistrict()				
			}
	}, 'json').fail( function(xhr, textStatus, errorThrown) { console.log(xhr.statusText); });
};
function loadDistrict(){
	$.post(apiUrl+'/province/district', {
		apiKey: apiKeyPower,
		province: $('#province').val(),
	}, function(data){
			if (data.success) {
				var html = '';
				for( i=0; i<data.result.length; i++ ) {
					var result = data.result[i];
					html += '<option value="'+ result.id +'" data-zipcode="'+ result.zipcode +'"'+ 
						((result.id == $('#district').attr('data-selected') && result.zipcode == $('#district').attr('data-zipcode')) ? ' selected' : '')
						+'>'+ result.name +'</option>';
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
	$('#claimModal').animate({ scrollTop: 0 }, 'fast');
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

	if ( fileCount == 0 ) addClaim();
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
					allProgress = 0;
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
		$('#file1').val() != '' && 
		$('#file2').val() != '' && 
		$('#file3').val() != '' &&
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
		if ($('#claim_description').val() == ''){
			$('#claim_description').focus();
		}else if ($('#file1').val() == ''){
			$('#file1').focus();
		}else if ($('#file2').val() == ''){
			$('#file2').focus();
		}else if ($('#file3').val() == ''){
			$('#file3').focus();
		}else if ($('#file4').val() == ''){
			$('#file4').focus();
		}
		
		$("#alert-claim_info").fadeIn();		
		setTimeout('$("#alert-claim_info").fadeOut()',4000);
	}
	
};

function addClaim(){	 
	$.post(apiUrl+'/claim/add', {
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
		sellNo: sellNo,
		sellPrice: sellPrice,
		usernameClaim: _username,
		customerLineId: $('#txt-lineid').val(),
		claimType: '',
		sellDate: sellDate
	}, function(data){
			if (data.success) {
				claimNo = data.result[0].claimNo;
				$('#claim-Massage').hide();
				//$('#claim-Massage').html(' * กรุณานำเลขที่การเคลมอ้างอิงกับเจ้าหน้าที่เพื่อติดตามสถานะงานเคลมที่ Line @remaxserive ค่ะ').addClass('text-success');
				$('#claim-ClaimNo').html('<b>เลขที่การเคลม: </b>'+ '<b class="text-danger">' + claimNo + '</b>');
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
				$('#sum-lineid').html($('#txt-lineid').val() != '' ? 'Line ID '+$('#txt-lineid').val() : '')

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
				//$('#dv-track').show();
				
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

function login() {
	$.post('http://24fin-api.azurewebsites.net/member/login', {
		apiKey: apiKey24,
		username: $.trim($('#username').val()),
		password: $('#password').val(), 
		remember: ($("#remember").is(':checked'))? 1 : 0
	}, function(data) {
		if (data.success) {
			if(data.correct){
				$('#message').html( '<i class="fa fa-spinner fa-pulse"></i> กำลังเข้าสู่ระบบ กรุณารอสักครู่ค่ะ' ).addClass('text-primary').removeClass('text-danger');
				setCookie("memberKey", data.authKey, 365);
				$('#hTitle').html('ส่งข้อมูลสินค้าเคลม ('+'คุณ'+ data.name +')');
				$('#tablogin').hide();
				$('#btn-logout_claim').show();
				$('#tabbarcode').show();
				
			}else{
				$('#btn-login').removeClass('disabled');
				$('#username, #password').removeAttr('disabled');
				$('#message').html( '<i class="fa fa-warning"></i> ชื่อผู้ใช้ หรือ รหัสผ่านไม่ถูกต้องค่ะ' ).addClass('text-danger').removeClass('text-primary');
			}
			
		}
		else {
			$('#btn-login').removeClass('disabled');
			$('#username, #password').removeAttr('disabled');
			$('#message').html( '<i class="fa fa-warning"></i> ชื่อผู้ใช้ หรือ รหัสผ่านไม่ถูกต้องค่ะ' ).addClass('text-danger').removeClass('text-primary');
		}
	});
}; 

function logout() {
	$.post('http://24fin-api.azurewebsites.net/member/logout', {
		apiKey: apiKey24,
		authKey: getCookie("memberKey")
	}, function(data) {
		if (data.success) {
			claimClick();			
		}		
	});
}; 

function simpleLog(){
	$.post(apiUrl+'/webclient/simplelog', {
		apiKey: apiKeyPower,
		name: $('#username').val(),
		value: 'userClaim'
	}, function(data){
			if (data.success) {
				$('#dv-claim_info').hide();
				$('#dv-track').hide();
				$('#alert-trackno').show();			
			}
	}, 'json').fail( function(xhr, textStatus, errorThrown) { console.log(xhr.statusText); });
};

function loadAdress(){
	if ($('#username').val() != '' && typeof $('#username').val() != 'undefined'){
		_username = $('#username').val();
	}
	$.post(apiUrl+'/claim/customerAddress', {
		apiKey: apiKeyPower,
		username: _username
	}, function(data){
			if (data.success) {
				if(data.result.length != 0){
					$('#txt-firstname').val(data.result[0].firstname);
					$('#txt-lastname').val(data.result[0].lastname);
					$('#txt-nickname').val(data.result[0].nickname);
					$('#txt-address').val(data.result[0].address);
					$('#txt-address2').val(data.result[0].address2);
					$('#province :selected').html(data.result[0].province),
					$('#district :selected').html(data.result[0].district),
					$('#txt-sub_district').val(data.result[0].subDistrict);
					$('#txt-zipcode').val(data.result[0].zipcode);
					$('#txt-tel').val(data.result[0].tel);
					$('#txt-email').val(data.result[0].email);	
					$('#txt-lineid').val(data.result[0].customerLineId);					
				}		
			}
			if($('#province :selected').html() == '' && $('#district :selected').html() == ''){
				loadAdress();
			}else{loadAdressComplete = true;}
	}, 'json').fail( function(xhr, textStatus, errorThrown) { console.log(xhr.statusText); });
};
function setCookie(cname, cvalue, exphr) {
    var d = new Date();
    d.setTime(d.getTime() + (exphr*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
};

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
};
 
function checkUser(){ 	 	
	$.post('http://24fin-api.azurewebsites.net/member/info/auth', {
		apiKey: apiKey24,
		authKey: getCookie("memberKey")
	}, function(data){
		if (data.success) {
			if(data.correct){
				if(data.result[0].length > 0 ){
					_username = data.result[0][0].username;
					loadAdress();
					$('#hTitle').html('ส่งข้อมูลสินค้าเคลม ('+'คุณ'+ data.result[0][0].name +')');
					$('#tablogin').hide();
					$('#tab-warranty-load').hide(); 
					$('#btn-logout_claim').show();
					$('#tabbarcode').show();
				}else{
					$('#tab-warranty-load').hide(); 
					$('#tablogin').show();
				}					
			}else{
				$('#tab-warranty-load').hide(); 
				$('#tablogin').show();
			}				
		}
		else {
			$('#tab-warranty-load').hide(); 
			$('#tablogin').show();
		}
	});
};

function barcodeExist(){	 
	$.post(apiUrl+'/claim/barcodeExist', {
		apiKey: apiKeyPower,
		barcode: $.trim($('#txt-barcode').val())
	}, function(data){
		if (data.success) {
			if (data.result[0].exist) {
				$('#tab-warranty-load').hide();
				$('#alert-barcode_exist').show();
			}else{
				$('#alert-barcode_exist').hide();
				warrantyInfo(); 
			}
		}else{
			$('#alert-barcode_exist').hide();
			warrantyInfo(); 
		}
	});

};