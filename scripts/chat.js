'use strict';

const Goodcount = require('../models/goodcount');
Goodcount.sync();

module.exports = robot => {
  // :+1: が付くと名前付きで褒めてくれ、いいねの数をカウント
  const markSet = new Set(); // 一度いいねされたメッセージ (TS)
  const sentSet = new Set(); // 送信済みいいね (TS:sendUserId)

  robot.react(res => {
    const ts = res.message.item.ts; // いいねされたメッセージのID (TS)
    const sendUserId = res.message.user.id;
    const keyOfSend = ts + ':' + sendUserId; // 対象メッセージID(TS):いいね送った人のID で重複排除
    if (
      res.message.type == 'added' &&
      res.message.reaction == '+1' &&
      !sentSet.has(keyOfSend) // その人が過去送ったことがなければインクリメント
    ) {
      const userId = res.message.item_user.id;
      const user = robot.brain.data.users[userId];

      // ボット自身の発言へと自身へのいいねを除外
      if (userId !== 'U7EADCN6N' && userId !== sendUserId) {
        Goodcount.findOrCreate({
          where: { userId: userId },
          defaults: {
            userId: userId,
            name: user.name,
            realName: user.real_name,
            displayName: user.slack.profile.display_name,
            goodcount: 0
          }
        }).spread((goodcount, isCreated) => {
          goodcount
            .increment('goodcount', { where: { userId: userId } })
            .then(() => {
              const newGoodcount = goodcount.goodcount;
              const displayName = user.slack.profile.display_name;
              if (
                newGoodcount == 1 ||
                newGoodcount == 5 ||
                newGoodcount == 10 ||
                newGoodcount == 20 ||
                newGoodcount == 30 ||
                newGoodcount == 40 ||
                newGoodcount == 50 ||
                newGoodcount == 100 ||
                newGoodcount == 500 ||
                newGoodcount == 1000 ||
                newGoodcount == 10000
              ) {
                res.send(
                  `${displayName}ちゃん、すごーい！記念すべき ${newGoodcount} 回目のいいねだよ！おめでとー！`
                );
              }

              // インクリメント後のset更新処理
              if (markSet.size > 100000) {
                markSet.clear(); // 10万以上、すごーいしたら一旦クリア
              }
              markSet.add(ts);

              if (sentSet.size > 100000) {
                sentSet.clear(); // 10万以上、すごーいしたら一旦クリア
              }
              sentSet.add(keyOfSend);
            });
        });
      }
    }
  });

  // サーバル　いくつ　と聞くといいねの数を答えてくれる
  robot.hear(/いくつ|いくつ？/i, msg => {
    const username = msg.message.user.profile.display_name;
    const user = msg.message.user;
    Goodcount.findOrCreate({
      where: { userId: user.id },
      defaults: {
        userId: user.id,
        name: user.name,
        realName: user.real_name,
        displayName: user.profile.display_name,
        goodcount: 0
      }
    }).spread((goodcount, isCreated) => {
      const message = `${username}ちゃんのいいねは${goodcount.goodcount}こだよ`;
      msg.send(message);
    });
  });

  // サーバルと呼びかけると答えてくれる
  robot.hear(/サーバル/i, msg => {
    const username = msg.message.user.profile.display_name;
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
  robot.hear(/悲しい|すみません|すいません|ごめんなさい|申し訳ない/i, msg => {
    const username = msg.message.user.profile.display_name;
    const messages = [
      'へーきへーき!　フレンズによって得意なこと違うから!',
      `${username}ちゃんはすっごい頑張り屋だから、きっとすぐ何が得意か分かるよ！`
    ];
    const message = messages[Math.floor(Math.random() * messages.length)];
    msg.send(message);
  });

  //新しいユーザーが増えるので一時的にコメントアウト
  //部屋に入ったユーザーへの案内
  // robot.enter(msg => {
  //   const username = msg.message.user.profile.display_name;
  //   //チャンネルのIDからチャンネル名を取得
  //   const room_name = robot.adapter.client.rtm.dataStore.getChannelGroupOrDMById(
  //     msg.envelope.room
  //   ).name;
  //   const message = `がーいど がーいど#${room_name} がーいどー\nいらっしゃい！ ここは #${room_name} だよ！ この辺は私のなわばりなの！\n${username}ちゃんはどこから来たの？ なわばりは？`;
  //   msg.send(message);
  // });
};
