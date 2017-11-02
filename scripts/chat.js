'use strict';

module.exports = (robot) => {
    // :+1: が付くと名前付きで褒めてくれる
    const sentSet = new Set();
    robot.react((res) => {
      const ts = res.message.item.ts;
      if (res.message.type == 'added' 
             && res.message.reaction == '+1'
             && !sentSet.has(ts)
            ) {
        const username = res.message.item_user.name;

        if(username != 'serval_bot') {
          res.send(`${username}ちゃん、すごーい！`);
        }

        if(sentSet.size > 100000) {
          sentSet.clear(); // 10万以上、すごーいしたら一旦クリア
        }
        sentSet.add(ts);
      }
    });

    // サーバルと呼びかけると答えてくれる
    robot.hear(/サーバル/i, (msg) => {
        const username = msg.message.user.name;
        const messages = [
          `${username}ちゃん、なんだい？`,
          'わーーい！',
          'たーのしー！',
          `${username}ちゃん、すごーい！`,
          `${username}ちゃん、まけないんだからー！`,
          'みゃー！うみゃー！みゃーー！',
          'た、たべないよー！',
          `${username}ちゃん、あ、ちょっとげんきになったー？`,
          'ここはジャパリパークだよ！わたしはサーバル！このへんはわたしのなわばりなの！',
          'あなたこそ、しっぽとみみのないフレンズ？めずらしいねー！',
          'どこからきたの？なわばりは？',
          'あ！きのうのサンドスターでうまれたこかなー？',
          'へーきへーき！フレンズによってとくいなことちがうからー！',
          'あ！だめ！それはセルリアンだよ！にげてー！',
          'だいじょうぶだよ！わたしだって、みんなからよく「どじー！」とか、「ぜんぜんよわいー！」とかいわれるもん！',
          'わたし、あなたのつよいところ、だんだんわかってきたよ！きっとすてきなどうぶつだよ！たのしみだねー！',
          'なっ！なんでわかったのー！？',
          'うわー、うわさどおりかわいいねー！',
          'こえもとってもかわいい！',
          'まいにちたのしそうだねー！',
          'きれいだね～！',
          'だいじょうぶだいじょうぶ！',
          'わかった！いこういこう！',
          'かんがえすぎだよー！',
          'みんなすごいねー！わたしだったら、そのへんでてきとうにねちゃうけどー…',
          'すっごーい！',
          'よろしくね！',
          'たのしそー！',
          'だいじょうぶだいじょうぶ！ちょっとたのしくなってきたよ！',
          `がんばって、${username}ちゃん！`,
          `もじ…ええー、これもじっていうんだ！${username}ちゃん、やっぱりすごいねー！`,
          'やったー！',
          'たのしそー！やるよー！',
          'キラキラしてるねー！',
          'わーい！はじめまして、わたしはサーバル！',
          `どうしたのー、${username}ちゃんらしくないよー？`,
          'おつかれさまー！',
          'なにそれなにそれ、みてみたい！',
          `${username}ちゃん、ほんとにいろんなことにきづくよね！`,
          'いままでみえないところでがんばってくれてたんだね！ありがとう！',
          'ボスー！',
          `${username}ちゃん、ねーなんかいってよー！`,
          'いーなー！わたしもおひるねしたいなー！',
          'わたしのことしってるのー？',
          'ここはほんとにたくさんのこがいるねー！',
          'え、なになにー！',
          `${username}ちゃん！`,
          'わかった！よーし、やるぞー！'
        ];
        const message = messages[Math.floor(Math.random() * messages.length)];
        msg.send(message);
    });

    //ネガティブなレスをすると慰めてくれる
    robot.hear(/悲しい|すみません|すいません|ごめんなさい|申し訳ない/i, (msg) => {
        const username = msg.message.user.name;
        const messages = [
          'へーきへーき!　フレンズによって得意なこと違うから!',
          'みんみー',
          `${username}ちゃんはすっごい頑張り屋だから、きっとすぐ何が得意か分かるよ！`
        ];
        const message = messages[Math.floor(Math.random() * messages.length)];
        msg.send(message);
    });

    //部屋に入ったユーザーへの案内
    robot.enter((msg) => {
      const username = msg.message.user.name;
      //チャンネルのIDからチャンネル名を取得
      const room_name = robot.adapter.client.rtm.dataStore.getChannelGroupOrDMById(msg.envelope.room).name;
        const message = `がーいど がーいど#${room_name} がーいどー\nいらっしゃい！ ここは #${room_name} だよ！ この辺は私のなわばりなの！\n${username}ちゃんはどこから来たの？ なわばりは？`
      msg.send(message);
    });
};
