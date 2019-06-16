// Description:
//   LoL の今日のチャンプ聞くことができるボット
//   ロールを決める簡単な機能ある
// Commands:
//   今日のチャンプ 今日のチャンプを教えてくれる
//   ロール決めて [name] [name] [name] [name] [name] ロールを決めてくれる

// リスト作成のためのスクリプト
// URL: https://jp.leagueoflegends.com/ja/game-info/champions/
// console script:
// let titles = document.querySelectorAll('li > div > div > a');
// let images = document.querySelectorAll('li > div > span > a > img');
// let messages = [];
// titles.forEach((e, i) => {
//     let m = e.innerText + ' ' + images[i].src;
//     messages.push(m);
//     });
// console.log(messages.join('\n'));
'use strict';

module.exports = robot => {
  robot.hear(/^今日のチャンプ/, msg => {
    let username = getUsername(msg);
    msg.send(createRandomChampMessage(username));
  });

  robot.hear(/^ロール決めて (.*)/, msg => {
    const parsed = msg.match[1];
    const summoners = shuffle(parsed.split(' '));
    msg.send(decideRole(summoners));
  });
};

function getUsername(msg) {
  let username = null;
  if (msg.message.user.profile) {
    username = msg.message.user.profile.display_name;
  }
  if (msg.message.user.display_name) {
    username = msg.message.user.display_name;
  }
  if (!username) {
    username = msg.message.user.name;
  }
  return username;
}

const allChampList = [
  'アイバーン https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Ivern.png',
  'アカリ https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Akali.png',
  'アジール https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Azir.png',
  'アッシュ https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Ashe.png',
  'アニビア https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Anivia.png',
  'アニー https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Annie.png',
  'アムム https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Amumu.png',
  'アリスター https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Alistar.png',
  'アーゴット https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Urgot.png',
  'アーリ https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Ahri.png',
  'イブリン https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Evelynn.png',
  'イラオイ https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Illaoi.png',
  'イレリア https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Irelia.png',
  'ウディア https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Udyr.png',
  'ウーコン https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/MonkeyKing.png',
  'エイトロックス https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Aatrox.png',
  'エコー https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Ekko.png',
  'エズリアル https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Ezreal.png',
  'エリス https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Elise.png',
  'オラフ https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Olaf.png',
  'オリアナ https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Orianna.png',
  'オレリオン・ソル https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/AurelionSol.png',
  'オーン https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Ornn.png',
  'カイ＝サ https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Kaisa.png',
  'カサディン https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Kassadin.png',
  'カシオペア https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Cassiopeia.png',
  'カタリナ https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Katarina.png',
  'カミール https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Camille.png',
  'カリスタ https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Kalista.png',
  'カルマ https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Karma.png',
  'カーサス https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Karthus.png',
  'カ＝ジックス https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Khazix.png',
  'ガリオ https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Galio.png',
  'ガレン https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Garen.png',
  'ガングプランク https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Gangplank.png',
  'キンドレッド https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Kindred.png',
  'クイン https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Quinn.png',
  'クレッド https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Kled.png',
  'グラガス https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Gragas.png',
  'グレイブス https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Graves.png',
  'ケイトリン https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Caitlyn.png',
  'ケイル https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Kayle.png',
  'ケイン https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Kayn.png',
  'ケネン https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Kennen.png',
  'コグ＝マウ https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/KogMaw.png',
  'コーキ https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Corki.png',
  'サイオン https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Sion.png',
  'サイラス https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Sylas.png',
  'ザイラ https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Zyra.png',
  'ザック https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Zac.png',
  'ザヤ https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Xayah.png',
  'シェン https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Shen.png',
  'シャコ https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Shaco.png',
  'シンジド https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Singed.png',
  'シンドラ https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Syndra.png',
  'シン・ジャオ https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/XinZhao.png',
  'シヴァーナ https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Shyvana.png',
  'シヴィア https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Sivir.png',
  'ジェイス https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Jayce.png',
  'ジグス https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Ziggs.png',
  'ジャックス https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Jax.png',
  'ジャンナ https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Janna.png',
  'ジャーヴァンⅣ https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/JarvanIV.png',
  'ジリアン https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Zilean.png',
  'ジン https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Jhin.png',
  'ジンクス https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Jinx.png',
  'スウェイン https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Swain.png',
  'スカーナー https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Skarner.png',
  'スレッシュ https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Thresh.png',
  'セジュアニ https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Sejuani.png',
  'ゼド https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Zed.png',
  'ゼラス https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Xerath.png',
  'ソナ https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Sona.png',
  'ソラカ https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Soraka.png',
  'ゾーイ https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Zoe.png',
  'タム・ケンチ https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/TahmKench.png',
  'タリック https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Taric.png',
  'タリヤ https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Taliyah.png',
  'タロン https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Talon.png',
  'ダイアナ https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Diana.png',
  'ダリウス https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Darius.png',
  'チョ＝ガス https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Chogath.png',
  'ツイステッド・フェイト https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/TwistedFate.png',
  'ティーモ https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Teemo.png',
  'トゥイッチ https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Twitch.png',
  'トランドル https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Trundle.png',
  'トリスターナ https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Tristana.png',
  'トリンダメア https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Tryndamere.png',
  'ドクター・ムンド https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/DrMundo.png',
  'ドレイヴン https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Draven.png',
  'ナサス https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Nasus.png',
  'ナミ https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Nami.png',
  'ナー https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Gnar.png',
  'ニダリー https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Nidalee.png',
  'ニーコ https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Neeko.png',
  'ヌヌ＆ウィルンプ https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Nunu.png',
  'ノクターン https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Nocturne.png',
  'ノーチラス https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Nautilus.png',
  'ハイマーディンガー https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Heimerdinger.png',
  'バード https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Bard.png',
  'パイク https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Pyke.png',
  'パンテオン https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Pantheon.png',
  'ビクター https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Viktor.png',
  'フィオラ https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Fiora.png',
  'フィズ https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Fizz.png',
  'フィドルスティックス https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Fiddlesticks.png',
  'ブラウム https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Braum.png',
  'ブラッドミア https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Vladimir.png',
  'ブランド https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Brand.png',
  'ブリッツクランク https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Blitzcrank.png',
  'ヘカリム https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Hecarim.png',
  'ベイガー https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Veigar.png',
  'ボリベア https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Volibear.png',
  'ポッピー https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Poppy.png',
  'マオカイ https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Maokai.png',
  'マスター・イー https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/MasterYi.png',
  'マルザハール https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Malzahar.png',
  'マルファイト https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Malphite.png',
  'ミス・フォーチュン https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/MissFortune.png',
  'モルガナ https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Morgana.png',
  'モルデカイザー https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Mordekaiser.png',
  'ヤスオ https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Yasuo.png',
  'ユーミ https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Yuumi.png',
  'ヨリック https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Yorick.png',
  'ライズ https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Ryze.png',
  'ラカン https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Rakan.png',
  'ラックス https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Lux.png',
  'ラムス https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Rammus.png',
  'ランブル https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Rumble.png',
  'リサンドラ https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Lissandra.png',
  'リヴェン https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Riven.png',
  'リー・シン https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/LeeSin.png',
  'ルシアン https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Lucian.png',
  'ルブラン https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Leblanc.png',
  'ルル https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Lulu.png',
  'レオナ https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Leona.png',
  'レク＝サイ https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/RekSai.png',
  'レネクトン https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Renekton.png',
  'レンガー https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Rengar.png',
  'ワーウィック https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Warwick.png',
  'ヴァイ https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Vi.png',
  'ヴァルス https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Varus.png',
  'ヴェイン https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Vayne.png',
  'ヴェル＝コズ https://ddragon.leagueoflegends.com/cdn/9.10.1/img/champion/Velkoz.png'
];

function createRandomChampMessage(username) {
  const champAndImage =
    allChampList[Math.floor(Math.random() * allChampList.length)];
  return username + '、これ使ったらどうかな ' + champAndImage;
}

function shuffle(list) {
  list = list.slice();
  let i = list.length;
  if (i === 0) {
    return list;
  }

  while (--i) {
    let j = Math.floor(Math.random() * (i + 1));
    let temp = list[i];
    list[i] = list[j];
    list[j] = temp;
  }
  return list;
}

function decideRole(summoners) {
  if (summoners.length < 5) {
    return summoners.length + '人じゃあ遊べないね...';
  }

  let shuffled = shuffle(summoners);
  let output = '';
  output += 'TOP: ' + shuffled[0];
  output += ', JUNGLE: ' + shuffled[1];
  output += ', MID: ' + shuffled[2];
  output += ', BOTTOM: ' + shuffled[3];
  output += ', SUPPORT: ' + shuffled[4];
  if (shuffled.length > 5) {
    output += ', 補欠: ' + shuffled.slice(5).join(' ');
  }
  return output;
}
