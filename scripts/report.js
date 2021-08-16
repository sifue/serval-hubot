'use strict';

const moment = require('moment');
const { WebClient } = require('@slack/web-api');
const token = process.env.HUBOT_SLACK_TOKEN;
const web = new WebClient(token);

const fs = require('fs');
const CHANNELS_LOG = 'channels_log';
const UPLOAD_FOLDER = './uploads/';

// チャンネルリストログの保存フォルダ作成
fs.mkdir(CHANNELS_LOG, err => {
  if (err && err.code !== 'EEXIST') {
    // すでにディレクトリ存在する以外のエラーの場合
    console.error(err);
  }
});

// Hubotのボット定義
module.exports = robot => {
  // 日次定期実行
  const CronJob = require('cron').CronJob;
  const job = new CronJob('0 0 6 * * *', () => {
    sendDailyReport(robot)
      .then(channels => {
        robot.logger.info('チャンネル人数の日次変化レポートを送信しました。');
      })
      .catch(console.error);
  });
  job.start();

  // ch-report>コマンド: レポートを送信する
  robot.hear(/^ch-report>/i, msg => {
    sendDailyReport(robot)
      .then(channels => {
        robot.logger.info('チャンネル人数の日次変化レポートを送信しました。');
      })
      .catch(console.error);
  });

  // ch-fetch>コマンド: Slackからのチャンネルリストの取得保存だけをする
  robot.hear(/^ch-fetch>/i, msg => {
    fetchChannelList()
      .then(channels => {
        const content =
          'Slackからチャンネルリストを取得してファイル保存しました。';
        msg.send(content);
        robot.logger.info(content);
      })
      .catch(console.error);
  });

  // times-ranking>コマンド: 現在のtimesがついているランキングを表示する
  robot.hear(/^times-ranking>/i, async msg => {
    let channels = await loadTodayChannelList();
    if (!channels) channels = await loadYesterdayChannelList();
    let rankedChannels = channels
      .filter(c => c.name.includes('times'))
      .sort((a, b) => b.num_members - a.num_members)
      .slice(0, 100)
      .map((c, i) => {
        c.rank = i + 1;
        return c;
      });

    // 同数と同順位とする
    let pre_num_members = -1;
    let pre_rank = -1;
    for (let c of rankedChannels) {
      if (c.num_members === pre_num_members) {
        c.rank = pre_rank;
      }
      pre_num_members = c.num_members;
      pre_rank = c.rank;
    }

    const content = { attachments: [] };
    const attachment = { fields: [] };
    attachment.color = '#658CFF';

    content.attachments.push(attachment);

    attachment.fields.push(
      {
        title: 'timesランキング',
        short: true
      },
      {
        title: 'チャンネル名',
        short: true
      }
    );

    rankedChannels.forEach(c => {
      attachment.fields.push({
        value: `第${c.rank}位 (${c.num_members}人)`,
        short: true
      });
      attachment.fields.push({
        value: `<#${c.id}>`,
        short: true
      });
    });

    msg.send(content);

    robot.logger.info('現在のtimesランキングを投稿しました.');
    robot.logger.info(content);
  });

  // times-rank> (チャンネル名) コマンド: 現在のtimesの順位を表示する
  robot.hear(/^times-rank> (.+)/i, async msg => {
    let nameStr = msg.match[1];
    robot.logger.info(`${nameStr}のランキングを調べます。`);
    nameStr = nameStr.replace('#', '').trim();
    let channels = await loadTodayChannelList();
    if (!channels) channels = await loadYesterdayChannelList();
    channels = channels
      .filter(c => c.name.includes('times'))
      .sort((a, b) => b.num_members - a.num_members)
      .map((c, i) => {
        c.rank = i + 1;
        return c;
      });

    // 同数と同順位とする
    let pre_num_members = -1;
    let pre_rank = -1;
    for (let c of channels) {
      if (c.num_members === pre_num_members) {
        c.rank = pre_rank;
      }
      pre_num_members = c.num_members;
      pre_rank = c.rank;
    }

    let channel = channels.filter(c => c.name === nameStr)[0];
    if (channel) {
      msg.send(
        `#${channel.name} はtimesチャンネルの中で第${channel.rank}位です。 (参加者数${channel.num_members}人)`
      );
    } else {
      msg.send(`#${nameStr} は見つかりませんでした。`);
    }

    robot.logger.info(`#${nameStr} のtimesランキングを調べました。`);
  });

  /**
   * 前日と今日のチャンネル人数のDiffを作成するしてレポートをファイルとして送る
   * - チャンネル
   * - 増減 (現在値)
   * @return Promise.<Object[]>
   */
  function sendDailyReport(robot) {
    return createNumMembersDiff().then(channels => {
      // const room = '#sifue_bot_dev';
      const room = '#なんでも宣伝チャンネル';
      let message = '前日より変化したチャンネル\t増減 (現在値)';

      channels.forEach(c => {
        message += '\n';
        message += c.is_new ? `${c.name} (新規)\t` : `${c.name} \t`;
        message +=
          (c.diff_num_members > 0
            ? `+${c.diff_num_members}`
            : `${c.diff_num_members}`) + ` (${c.num_members})`;
      });

      // アップロードフォルダ作成
      if (!fs.existsSync(UPLOAD_FOLDER)) {
        fs.mkdirSync(UPLOAD_FOLDER);
      }
      const titlefilename =
        moment(new Date()).format('YYYY-MM-DD') +
        'の前日より変化したチャンネル.csv';
      const csvFile = UPLOAD_FOLDER + titlefilename;
      fs.writeFileSync(csvFile, message);

      const option = {
        channels: room,
        file: fs.createReadStream(csvFile),
        filename: titlefilename
      };

      return web.files.upload(option).then(() => {
        // fs.unlinkSync(csvFile);
        return channels;
      });
    });
  }

  /**
   * 前日と今日のチャンネル人数のDiffを作成する
   * @return Promise.<Object[]>
   */
  function createNumMembersDiff() {
    return loadYesterdayChannelList().then(yesterdayChannels => {
      const yesterdayMap = new Map();
      yesterdayChannels.forEach(c => {
        yesterdayMap.set(c.id, c);
      });

      return fetchChannelList().then(todayChannels => {
        // return loadTodayChannelList().then(todayChannels => {
        // Diff配列を作る
        const diffs = [];
        todayChannels.forEach(c => {
          if (yesterdayMap.has(c.id)) {
            const yesterdayChannel = yesterdayMap.get(c.id);
            // チャンネル人数に差があるチャンネルを属性足して追加
            if (c.num_members !== yesterdayChannel.num_members) {
              c.is_new = false;
              c.diff_num_members = c.num_members - yesterdayChannel.num_members;
              diffs.push(c);
            }
          } else {
            // 新規チャンネルもdiffに入れる
            c.is_new = true;
            c.diff_num_members = c.num_members;
            diffs.push(c);
          }
        });

        // 増減数の降順でソート
        diffs.sort((a, b) => {
          return b.diff_num_members - a.diff_num_members;
        });
        return diffs;
      });
    });
  }

  /**
   * 前日のログファイルをローカルファイルをより取得する
   * @return Promise.<Object[]>
   */
  function loadYesterdayChannelList() {
    const yesterday = new Date(new Date().getTime() - 1000 * 60 * 60 * 24);
    const filename =
      CHANNELS_LOG + '/' + moment(yesterday).format('YYYY-MM-DD') + '.json';
    return new Promise((resolve, reject) => {
      fs.readFile(filename, 'utf-8', (err, data) => {
        if (err) {
          reject(err);
          return;
        }
        return resolve(JSON.parse(data));
      });
    });
  }

  /**
   * 本日のログファイルをローカルファイルをより取得する
   * @return Promise.<Object[]>
   */
  function loadTodayChannelList() {
    const today = new Date();
    const filename =
      CHANNELS_LOG + '/' + moment(today).format('YYYY-MM-DD') + '.json';
    return new Promise((resolve, reject) => {
      fs.readFile(filename, 'utf-8', (err, data) => {
        if (err) {
          reject(err);
          return;
        }
        return resolve(JSON.parse(data));
      });
    });
  }

  /**
   * チャンネル一覧をSlackより取得し、その日のファイルとして上書き保存する
   * @return Promise.<Object[]>
   */
  function fetchChannelList() {
    const filename =
      CHANNELS_LOG + '/' + moment().format('YYYY-MM-DD') + '.json';

    return fetchChannelListRec().then(res => {
      return new Promise((resolve, reject) => {
        fs.writeFile(filename, JSON.stringify(res.channels), err => {
          if (err) {
            reject(err);
            return;
          }
          resolve(res.channels);
        });
      });
    });
  }

  /**
   * チャンネル一覧をSlackより取得し、cursorを使ったものをまとめて結合する
   * @return Promise.<Object[]>
   */
  async function fetchChannelListRec() {
    let cursor;
    let channels = [];

    do {
      const res = await web.conversations.list({
        cursor: cursor,
        exclude_archived: true,
        limit: 1000,
        types: 'public_channel'
      });

      if (res.ok && res.response_metadata) {
        cursor = res.response_metadata.next_cursor;
        channels = channels.concat(res.channels);
      } else {
        console.log(
          '[ERROR] 正しくconversations.list APIが利用できませんでした。 res:'
        );
        console.log(res);
      }
    } while (cursor);

    return { channels };
  }
};
