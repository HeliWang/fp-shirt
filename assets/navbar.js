$(document).ready(function(){
    var $ = jQuery.noConflict(); 
    var scope = angular.element(document.getElementById('namebrand')).scope();

    $('#projectModal').modal('show'); 
     
    $('#projectnameedit').show(function(){
        $(this).val(scope.projectname);
    });
    
    $("#modalConfirm").click(function(){
       $('#shirtMenu').stop( true, true ).slideDown("fast");
       $('#shirtMenu').toggleClass('open'); 

       scope.$apply(function(){
        scope.projectname = $('#projectnameedit').val();
       });
    
       $('namebrand').text("dd");
    });
    
    $(".dropdown").hover(            
        function() {
            $('.dropdown-menu', this).stop( true, true ).slideDown("fast");
            $(this).toggleClass('open');        
        },
        function() {
            $('.dropdown-menu', this).stop( true, true ).slideUp("fast");
            $(this).toggleClass('open');       
        }
    );
});
