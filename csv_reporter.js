'use strict';
const fs = require('fs');
const CHANNELS_LOG = 'channels_log';
const CSV_FILE = 'report.csv';

main();

/**
 * CSVに過去のチャンネルログデータを書き出す処理のメイン関数
 */
async function main() {
  const logFiles = await getLogFiles().catch(e => console.error(e));
  const channelIds = new Set();
  const channelMapMap = new Map(); // Map<Key: day, Value: Map<Key: channelId, Value: numMembers>>
  const channelNameMap = new Map(); // Map Map<Key: channelId, Value: name>

  console.log('Loading logs...');
  await Promise.all(
    logFiles.map(async logFile => {
      const filename = CHANNELS_LOG + '/' + logFile;
      const logData = await getLogData(filename);
      const day = logFile.split('.json')[0];
      const numMembersMap = new Map();
      logData.forEach(channel => {
        const channelId = channel.id;
        const channelName = channel.name;
        const channelNumMembers = channel.num_members;
        channelIds.add(channelId);
        numMembersMap.set(channelId, channelNumMembers);
        channelNameMap.set(channelId, channelName);
      });
      channelMapMap.set(day, numMembersMap);
    })
  ).catch(e => console.error(e));

  console.log('Saving CSV report...');
  const logDays = logFiles.map(e => e.split('.json')[0]);
  let header = 'id\tname\t' + logDays.join('\t') + '\n';
  await appendCSV(header).catch(e => console.error(e));

  await Promise.all(
    Array.from(channelIds).map(async id => {
      let line = id + '\t' + channelNameMap.get(id);
      logDays.forEach(day => {
        let numMembers = 0;
        if (channelMapMap.has(day)) {
          const numMembersMap = channelMapMap.get(day);
          if (numMembersMap.has(id)) {
            numMembers = numMembersMap.get(id);
          }
        }
        line += '\t' + numMembers;
      });
      line += '\n';
      await appendCSV(line).catch(e => console.error(e));
    })
  ).catch(e => console.error(e));

  console.log('Finished. Saved CSV File: ' + CSV_FILE);
}

/**
 * ログファイルのリストを取得する
 * @returns Priomise.<Object[]>
 */
function getLogFiles() {
  return new Promise((resolve, reject) => {
    fs.readdir(CHANNELS_LOG, (err, files) => {
      if (err) {
        reject(err);
        return;
      }
      var fileList = files.filter(file => {
        return (
          fs.statSync(CHANNELS_LOG + '/' + file).isFile() &&
          /.*\.json$/.test(file)
        );
      });
      resolve(fileList);
    });
  });
}

/**
 * ログファイルの中身のログデータを読み込む
 * @param filename ファイル名
 * @returns Priomise.<Object[]>
 */
function getLogData(filename) {
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
 * CSVファイルに文字列を書き出す
 * @param str 文字列
 * @returns Priomise.<undfined>
 */
function appendCSV(str) {
  return new Promise((resolve, reject) => {
    fs.appendFile(CSV_FILE, str, err => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}
