'use strict';

const Goodcount = require('../models/goodcount');
Goodcount.sync();

const fs = require('fs');
const joinMessagesFileName = './join_messages.json';
let joinMessages = new Map(); // key: チャンネルID, value: 入室メッセージ

function saveJoinMessages() {
  fs.writeFileSync(
    joinMessagesFileName,
    JSON.stringify(Array.from(joinMessages)),
    'utf8'
  );
}

function loadJoinMessages() {
  try {
    const data = fs.readFileSync(joinMessagesFileName, 'utf8');
    joinMessages = new Map(JSON.parse(data));
  } catch (e) {
    console.log('loadJoinMessages Error:');
    console.log(e);
    console.log('空のjoinMessagesを利用します');
  }
}

module.exports = robot => {
  loadJoinMessages();

  // :+1: が付くと名前付きで褒めてくれ、いいねの数をカウント
  const sentSet = new Set(); // 送信済みいいね (room:TS:sendUserId)

  robot.react(res => {
    const ts = res.message.item.ts; // いいねされたメッセージのID (room:TS)
    const sendUserId = res.message.user.id;
    const keyOfSend = res.message.room + ':' + ts + ':' + sendUserId; // 対象メッセージID(room:TS):いいね送った人のID で重複カウント排除
    if (
      res.message.type == 'added' &&
      res.message.reaction == '+1' &&
      !sentSet.has(keyOfSend) // その人が過去送ったことがなければインクリメント
    ) {
      const userId = res.message.item_user.id;
      const user = robot.brain.data.users[userId]; // ユーザー規模が大きすぎると起動時brainのフェッチに失敗するようになるので無いこともある前提

      // ボット自身の発言へと自身へのいいねを除外
      if (userId !== 'U7EADCN6N' && userId !== sendUserId) {
        Goodcount.findOrCreate({
          where: { userId: userId },
          defaults: {
            userId: userId,
            name: user ? user.name : '',
            realName: user ? user.real_name : '',
            displayName: user ? user.slack.profile.display_name : '',
            goodcount: 0
          }
        }).spread((goodcount, isCreated) => {
          goodcount
            .increment('goodcount', { where: { userId: userId } })
            .then(() => {
              const newGoodcount = goodcount.goodcount;
              if (
                newGoodcount === 10 ||
                newGoodcount === 50 ||
                newGoodcount % 100 === 0
              ) {
                res.send(
                  `<@${userId}>ちゃん、すごーい！記念すべき ${newGoodcount} 回目のいいねだよ！おめでとー！`
                );
              }

              if (sentSet.size > 100000) {
                sentSet.clear(); // 10万以上、すごーいしたら一旦クリア
              }
              sentSet.add(keyOfSend);
            });
        });
      }
    }
  });

  // いいねいくつ？ と聞くといいねの数を答えてくれる
  robot.hear(/いいねいくつ[\?？]/i, msg => {
    const user = msg.message.user;

    let username = msg.message.user.profile.display_name;
    if (!username) {
      username = user.name;
    }

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
      const message = `${username}ちゃんのいいねは ${goodcount.goodcount} こだよ！`;
      msg.send(message);
    });
  });

  // 発言したチャンネルに入室メッセージを設定する
  robot.hear(/^入室メッセージを登録して (.*)/i, msg => {
    const parsed = msg.message.rawText.match(/^入室メッセージを登録して (.*)/);
    // console.log(msg);
    if (parsed) {
      const joinMessage = parsed[1];
      const channelId = msg.envelope.room;
      joinMessages.set(channelId, joinMessage);
      saveJoinMessages();
      msg.send(`入室メッセージ:「${joinMessage}」を登録したよ。`);
    }
  });

  // 発言したチャンネルの入室メッセージの設定を解除する
  robot.hear(/^入室メッセージを消して/i, msg => {
    const channelId = msg.envelope.room;
    joinMessages.delete(channelId);
    saveJoinMessages();
    msg.send(`入室メッセージを削除したよ。`);
  });

  // 発言したチャンネルの入室メッセージの設定を確認する
  robot.hear(/^入室メッセージを見せて/i, msg => {
    const channelId = msg.envelope.room;
    for (let [key, value] of joinMessages) {
      if (channelId === key) {
        let message = value.replace(/\\n/g, '\n');
        msg.send(`現在登録されている入室メッセージは\n\n${message}\n\nだよ。`);
      }
    }
  });

  //部屋に入ったユーザーへの入室メッセージを案内 %USERNAME% はユーザー名に、%ROOMNAME% は部屋名に、\\n は改行コード(\n)に置換
  robot.enter(msg => {
    let username;
    if (msg.message.user.profile)
      username = msg.message.user.profile.display_name;
    if (!username) username = msg.message.user.name;

    //チャンネルのIDからチャンネル名を取得
    const channelId = msg.envelope.room;
    const roomname = robot.adapter.client.rtm.dataStore.getChannelGroupOrDMById(
      channelId
    ).name;

    for (let [key, value] of joinMessages) {
      if (channelId === key) {
        let message = value
          .replace('%USERNAME%', username)
          .replace('%ROOMNAME%', '#' + roomname)
          .replace(/\\n/g, '\n');
        msg.send(message);
      }
    }
  });
};
