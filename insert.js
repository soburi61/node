//loadContent("contents/test.html");
function loadContent(url){
    const mainContent = document.getElementById('main-content');
    fetch(url)
        .then((response) => {
            if(!response.ok){
                throw new Error(`HTTP error:${response.status}`);
            }
            return response.text();
        })
        .then((html) => mainContent.appendChild(document.createTextNode(html)))
        .catch((error) => mainContent.innerHTML =  `<p>Could not fetch verse: ${error}</p>`);
}
function showQiita(){
        // Qiitaユーザー名を定数として定義
    const userId = 'soburi06';

    // APIエンドポイントを定数として定義（${}内には変数userIdが入ります）
    const url = `https://qiita.com/api/v2/users/${userId}/items`;

    // 投稿一覧を表示する要素のIDを取得して、container定数に代入する
    const container = document.getElementById('main-content');

    // fetch関数によってQiita APIからデータを取得
    fetch(url, {
    headers: {
        // Authorizationヘッダーにアクセストークンを指定
        'Authorization': 'Bearer 2818a0595b34040ffe4d93988b435a68df2bb897'
    }
    })
    // 読み込んだレスポンスの内容をJSON形式に変換してリターンする
    .then(response => response.json())
    // JSON形式のデータを引数にしてコールバック関数を実行
    .then(data => {
        // HTMLの文字列を作成するための変数htmlを定義
        let html = '<div class="qiita-posts">';
        // forEachメソッドで投稿データ一つずつループ処理を行う
        data.forEach(post => {
        // テンプレートリテラルを使ってHTMLの文字列を作成
        html += `
                <div class="qiita-post">
                    <a class="qiita-link" href="${post.url}" target="_blank" rel="noopener noreferrer"></a>
                    <a class="qiita-text">${post.title}</a>
                    <div class="tags">
                `;
        
        // 投稿のタグ情報をループ処理でタグ名をHTML書式に追加する
        post.tags.forEach(function(tag) {
            html+= `<a class="tag-name" href="https://qiita.com/tags/${tag.name}">`+ tag.name + '</a>';
        });
        
        html += `       
                    </div>
                    <div class="date">${post.created_at.slice(0, 10)}</div>
                </div>
                `;
        });
        html+="</div>";
        // 完成したHTML文字列を要素に挿入
        container.innerHTML = html;
    })
    // エラー時のコールバック関数
    .catch(error => console.error(error));

}