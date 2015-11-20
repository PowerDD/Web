$(function() {

	$('#txt-tel').ForceNumericOnly();

	$(document).on('click', '#btn-sent_message', function(){
		$('.required').parent().removeClass('has-error');
		$('.required').each(function(){
			if ( $.trim($(this).val()) == '' ) {
				$(this).focus().parent().addClass('has-error');
				return false;
			}
		});
		
		if ( $('.has-error').length == 0 && !validateEmail($.trim($('#txt-email').val())) )
		{
			$('#txt-email').focus().parent().addClass('has-error');
		}
		else if ( $('.has-error').length == 0 ) {
			$.post($('#api_url').val()+'mail/ideanova/contact', {
				apiKey: $('#api_key').val(),
				name: $.trim($('#txt-name').val()),
				email: $.trim($('#txt-email').val()),
				tel: $.trim($('#txt-tel').val()),
				message: $.trim($('#txt-message').val()),
			}, function(data){
				if(data.success) {
					$('#frm-contact').slideUp();
					$('#dv-alert_success').show();
				}
				else {
					$('#frm-contact').slideUp();
					$('#dv-alert_fail').show();
					setTimeout(function(){
						$('#frm-contact').stop().slideDown();
						$('#dv-alert_fail').stop().fadeOut();
					}, 2000);
				}
			}, 'json');
		}

	});	
	
});