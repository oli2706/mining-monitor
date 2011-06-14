var data = {};
try {
    data = JSON.parse(localStorage.options);   
}catch(e){  
}
var defaults = chrome.extension.getBackgroundPage().defaults;
var pools = chrome.extension.getBackgroundPage().pools;
var options = $.extend({}, defaults, data);

window.onload = function(){
    $('.lang').text(function(){
        console.log(this.tagName);
        if(this.tagName != 'INPUT'){
            return chrome.i18n.getMessage($(this).attr('id'));
        }
    });
    
    $('input.lang').val(function(){
        console.log(this);
        return chrome.i18n.getMessage($(this).attr('id'));
    });    
    
    $('input[type="text"]').keyup(function(){
        var count = 0;
        for(var pool in pools){
            if($('#' + pool + '_token').val() != ''){
                count++;            
            }
        }
        
        if(count > 1){
            $('#summary').attr('disabled', false);
        }else{
            $('#summary').attr('disabled', true);
        }
        
        $('#save').removeClass('saved').val(chrome.i18n.getMessage('save'));
    });
     
    for(var p in pools){
        $('#tokens').append('<label for="' + p + '_token" id="' + p + '_token_label" class="token">' + pools[p].title + '</label><input type="text" name="' + p + '_token" id="' + p + '_token" /><br/>');                        
        
        $('#' + p + '_token').val(options[p].token).keyup();        
    }    
    
    $('#summary').attr('checked', options.summary).change();
    $('input[name="badge"]').val([options.badge]);

    $('form').submit(function(){
        var data = {           
            summary: $('#summary').is(':checked'),
            badge: $('input[name="badge"]:checked').val()
        }
        for(var pool in pools){
            data[pool] = {
                token: $('#' + pool + '_token').val()
            }
        }
        console.log(data);
        window.localStorage.options = JSON.stringify(data);
        chrome.extension.getBackgroundPage().updateOptions();
        chrome.extension.getBackgroundPage().startRequest();
        $('#save').addClass('saved').val(chrome.i18n.getMessage('saved'));
        return false;
    }).change(function(){
        $('#save').removeClass('saved').val(chrome.i18n.getMessage('save'));
    });
    
    $('#tokens_auto').click(function(){
        for(var p in pools){
            $('#' + p + '_token_label').removeClass('ok error').addClass('loading');
            (function(p){
                $.ajax({
                    url: pools[p].url + pools[p].token_url,
                    success: function(data){
                        var element = $(data).find(pools[p].token_selector);
                        var value = pools[p].token_text ? element.text() : element.val();
                        if(value){
                            $('#' + p + '_token_label').addClass('ok');
                            $('#' + p + '_token').val(value);
                        }else {
                            $('#' + p + '_token_label').addClass('error');
                        }
                    },
                    complete: function(){
                        $('#' + p + '_token_label').removeClass('loading');
                    },
                    error: function(){
                        $('#' + p + '_token_label').addClass('error');
                    }
                });
            })(p);
        }
    });
}