(function ($) {
  $.fn.UIchatBot = function (options) {
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

    $('body').append(`
          <div id="${settings.containerID}">
              <span id="${settings.containerHoverID}"></span>
              <a href="#" class="chat-btn">${settings.text}</a>
              <div class="chat-window" style="display: none;">
                  <div class="chat-header">Chatbot <span class="close-btn">✖</span></div>
                  <div class="chat-messages"></div>
                  <div class="chat-input">
                      <input type="text" placeholder="輸入您的問題...">
                      <button class="send-btn">送出</button>
                  </div>
              </div>
          </div>
      `);

    $('<style>').prop('type', 'text/css').html(`
          #${settings.containerID} {
              position: fixed;
              bottom: 10px;
              right: 70px;
              z-index: 9999;
          }
          .chat-btn {
              display: block;
              padding: 10px 20px;
              background: #06293C;
              color: white;
              text-decoration: none;
              border-radius: 25px;
              box-shadow: 0 2px 5px rgba(0,0,0,0.2);
              transition: background 0.3s;
          }
          .chat-btn:hover {
              background: #094058;
          }
          .chat-window {
              position: absolute;
              bottom: 60px;
              right: 0;
              width: 400px;
              height: 400px;
              background: white;
              border-radius: 10px;
              box-shadow: 0 0 10px rgba(0,0,0,0.2);
              display: flex;
              flex-direction: column;
          }
          .chat-header {
              padding: 10px;
              background: #06293C;
              color: white;
              border-radius: 10px 10px 0 0;
              position: relative;
          }
          .close-btn {
              position: absolute;
              right: 10px;
              cursor: pointer;
              font-size: 16px;
          }
          .close-btn:hover {
              color: #ffcccc;
          }
          .chat-messages {
              flex: 1;
              padding: 10px;
              overflow-y: auto;
          }
          .chat-message {
              margin: 10px 0;
              padding: 8px 12px;
              border-radius: 8px;
              max-width: 80%;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
              border: 1px solid #ddd;
          }
          .user-message {
              background: #007bff;
              color: white;
              text-align: left;
              margin-left: auto;
              border-color: #0056b3;
          }
          .bot-message {
              background: #f1f1f1;
              color: #333;
              text-align: left;
              margin-right: auto;
              border-color: #ccc;
          }
          .bot-message a {
              color: #06293C; /* 連結顏色與主色一致 */
              text-decoration: underline;
              cursor: pointer; /* 確保可點擊 */
          }
          .bot-message a:hover {
              color: #094058; /* hover 效果 */
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
              border: 1px solid #ccc;
              border-radius: 4px;
          }
          .send-btn {
              padding: 5px 10px;
              background: #06293C;
              color: white;
              border: none;
              border-radius: 5px;
              cursor: pointer;
              transition: background 0.3s;
          }
          .send-btn:hover {
              background: #094058;
          }
      `).appendTo('head');

    $(containerIDhash).show()
      .find('.chat-btn').on('click.UIchatBot', function (e) {
        e.preventDefault();
        const $chatWindow = $(this).siblings('.chat-window');
        $chatWindow.toggle();
        if ($chatWindow.is(':visible')) {
          const $messages = $chatWindow.find('.chat-messages');
          if ($messages.is(':empty')) {
            $messages.append('<div class="chat-message bot-message">您好！請問有什麼我可以幫您的？您可以問問最新的課程或潛水裝備推薦！</div>');
          }
        }
      });

    $(containerIDhash).find('.close-btn').on('click', function () {
      $(this).closest('.chat-window').hide();
    });

    $(containerIDhash).find('.send-btn').on('click', function () {
      const $input = $(this).siblings('input');
      const message = $input.val().trim();
      if (message) {
        const $messages = $(this).closest('.chat-window').find('.chat-messages');
        $messages.append(`<div class="chat-message user-message">用戶: ${message}</div>`);
        $input.val('');

        $.ajax({
          url: 'https://localhost:7107/api/chat',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({ message: message }),
          success: function (response) {
            // 使用 jQuery 確保 HTML 正確渲染
            const $messageDiv = $('<div class="chat-message bot-message"></div>');
            const replyHtml = response.reply.replace(
              /(https:\/\/[^\s]+)/g,
              '<a href="$1" target="_blank" style="color: #06293C; text-decoration: underline;">$1</a>'
            );
            $messageDiv.html(`Chatbot: ${replyHtml}`);
            $messages.append($messageDiv);
            $messages.scrollTop($messages[0].scrollHeight);
          },
          error: function (xhr, status, error) {
            console.error('Error:', error);
            $messages.append('<div class="chat-message bot-message" style="color: red;">Chatbot: 抱歉，出了點問題！</div>');
            $messages.scrollTop($messages[0].scrollHeight);
          }
        });
      }
    });

    $(containerIDhash).find('.chat-input input').on('keypress', function (e) {
      if (e.which === 13) {
        $(this).siblings('.send-btn').click();
      }
    });
  };
})(jQuery);

$(document).ready(function () {
  $().UIchatBot({
    text: '找我聊聊'
  });
});
