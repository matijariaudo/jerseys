function CardInit(functionNext=()=>{console.log("Sin funcion")},onMatch=()=>{console.log("Sin funcion exitosa")}) {

    var animating = false;
    var cardsCounter = 0;
    var numOfCards = 1;
    var decisionVal = 80;
    var pullDeltaX = 0;
    var deg = 0;
    var $card, $cardReject, $cardLike;
    var $idActual=null;
    $("#btnLike").on('click',()=>{
        simulateSwipe('right');
    })
    $("#btnUnLike").on('click',()=>{
        simulateSwipe('left');
    })
    
    
    function pullChange() {
      animating = true;
      deg = pullDeltaX / 10;
      $card.css("transform", "translateX("+ pullDeltaX +"px) rotate("+ deg +"deg)");
  
      var opacity = pullDeltaX / 100;
      var rejectOpacity = (opacity >= 0) ? 0 : Math.abs(opacity);
      var likeOpacity = (opacity <= 0) ? 0 : opacity;
      $cardReject.css("opacity", rejectOpacity);
      $cardLike.css("opacity", likeOpacity);
      
    };
  
    function release() {
  
      if (pullDeltaX >= decisionVal) {
        $card.addClass("to-right");
        console.log(`${$idActual} Match`)
        onMatch($idActual)
        functionNext();
      } else if (pullDeltaX <= -decisionVal) {
        $card.addClass("to-left");
        console.log(`${$idActual} Match`)
        functionNext();
      }
  
      if (Math.abs(pullDeltaX) >= decisionVal) {
        $card.addClass("inactive");
        
        setTimeout(function() {
          if(true)return "NO RESET"
          $card.addClass("below").removeClass("inactive to-left to-right");
          cardsCounter++;
          if (cardsCounter === numOfCards) {
            cardsCounter = 0;
            $(".demo__card").removeClass("below");
          }
        }, 300);
        
      }
  
      if (Math.abs(pullDeltaX) < decisionVal) {
        $card.addClass("reset");
      }
  
      setTimeout(function() {
        $card.attr("style", "").removeClass("reset")
          .find(".demo__card__choice").attr("style", "");
  
        pullDeltaX = 0;
        animating = false;
      }, 300);
    };
  
    $(document).on("mousedown touchstart", ".demo__card:not(.inactive)", function(e) {
      if (animating) return;
  
      $card = $(this);
      $idActual=$card.attr('id')
      $cardReject = $(".demo__card__choice.m--reject", $card);
      $cardLike = $(".demo__card__choice.m--like", $card);
      var startX =  e.pageX || e.originalEvent.touches[0].pageX;
  
      $(document).on("mousemove touchmove", function(e) {
        var x = e.pageX || e.originalEvent.touches[0].pageX;
        pullDeltaX = (x - startX);
        if (!pullDeltaX) return;
        pullChange();
      });
  
      $(document).on("mouseup touchend", function() {
        $(document).off("mousemove touchmove mouseup touchend");
        if (!pullDeltaX) return; // prevents from rapid click events
        release();
      });
    });

    function simulateSwipe(direction) {
        if (animating) return;
        
        $card = $(".demo__card:not(.inactive)").first();
        if (!$card.length) return;
    
        $idActual = $card.attr("id");
        $cardReject = $(".demo__card__choice.m--reject", $card);
        $cardLike = $(".demo__card__choice.m--like", $card);
        paso=12
        pullDeltaX = direction === "right" ? decisionVal + paso : -decisionVal - paso;
        pullChange();
        
        setTimeout(() => {
            release();
        }, 200);
    }

  
  }

  