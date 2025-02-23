(function($){
  $.fn.UIchatBot = function(options) {

      var defaults = {
          text: 'Chat with Us',
          min: 200,
          inDelay: 600,
          outDelay: 400,
          containerID: 'chatBot',
          containerHoverID: 'chatBotHover',
          scrollSpeed: 1200,
          easingType: 'linear'
      },
      settings = $.extend(defaults, options),
      containerIDhash = '#' + settings.containerID,
      containerHoverIDHash = '#' + settings.containerHoverID;

      // 添加按鈕和聊天視窗的 HTML
      $('body').append(`
          <div id="${settings.containerID}">
              <span id="${settings.containerHoverID}"></span>
              <a href="#" class="chat-btn">${settings.text}</a>
              <div class="chat-window" style="display: none;">
                  <div class="chat-header">Chatbot</div>
                  <div class="chat-messages"></div>
                  <div class="chat-input">
                      <input type="text" placeholder="Type your message...">
                      <button class="send-btn">Send</button>
                  </div>
              </div>
          </div>
      `);

      // 添加基本的 CSS
      $('<style>').prop('type', 'text/css').html(`
          #${settings.containerID} {
              position: fixed;
              bottom: 20px;
              right: 20px;
              z-index: 9999;
          }
          .chat-btn {
              display: block;
              padding: 10px 20px;
              background: #007bff;
              color: white;
              text-decoration: none;
              border-radius: 25px;
              box-shadow: 0 2px 5px rgba(0,0,0,0.2);
          }
          .chat-window {
              position: absolute;
              bottom: 60px;
              right: 0;
              width: 300px;
              height: 400px;
              background: white;
              border-radius: 10px;
              box-shadow: 0 0 10px rgba(0,0,0,0.2);
              display: flex;
              flex-direction: column;
          }
          .chat-header {
              padding: 10px;
              background: #007bff;
              color: white;
              border-radius: 10px 10px 0 0;
          }
          .chat-messages {
              flex: 1;
              padding: 10px;
              overflow-y: auto;
          }
          .chat-input {
              padding: 10px;
              border-top: 1px solid #eee;
              display: flex;
          }
          .chat-input input {
              flex: 1;
              padding: 5px;
              margin-right: 5px;
          }
          .send-btn {
              padding: 5px 10px;
              background: #007bff;
              color: white;
              border: none;
              border-radius: 5px;
              cursor: pointer;
          }
      `).appendTo('head');

      // 按鈕事件處理
      $(containerIDhash).hide()
          .find('.chat-btn').on('click.UIchatBot', function(e) {
              e.preventDefault();
              const $chatWindow = $(this).siblings('.chat-window');
              $chatWindow.toggle();
              if ($chatWindow.is(':visible')) {
                  // 顯示歡迎訊息
                  const $messages = $chatWindow.find('.chat-messages');
                  if ($messages.is(':empty')) {
                      $messages.append('<div>Hello! How can I assist you today?</div>');
                  }
              }
          });

      // 發送訊息功能
      $(containerIDhash).find('.send-btn').on('click', function() {
          const $input = $(this).siblings('input');
          const message = $input.val().trim();
          if (message) {
              const $messages = $(this).closest('.chat-window').find('.chat-messages');
              $messages.append(`<div style="margin: 5px 0; text-align: right;">${message}</div>`);
              $input.val('');
              // 模擬 chatbot 回應
              setTimeout(() => {
                  $messages.append('<div style="margin: 5px 0;">I understand. How can I help you with that?</div>');
                  $messages.scrollTop($messages[0].scrollHeight);
              }, 1000);
          }
      });

      // 捲動顯示/隱藏邏輯
      $(window).scroll(function() {
          var sd = $(window).scrollTop();
          if(typeof document.body.style.maxHeight === "undefined") {
              $(containerIDhash).css({
                  'position': 'absolute',
                  'top': sd + $(window).height() - 50
              });
          }
          if (sd > settings.min)
              $(containerIDhash).fadeIn(settings.inDelay);
          else
              $(containerIDhash).fadeOut(settings.outDelay);
      });

      // 處理輸入框的 Enter 鍵
      $(containerIDhash).find('.chat-input input').on('keypress', function(e) {
          if (e.which === 13) {
              $(this).siblings('.send-btn').click();
          }
      });
  };
})(jQuery);

// 使用方式：
$(document).ready(function(){
  $().UIchatBot({
      text: 'Chat Now' // 可自訂按鈕文字
  });
});
