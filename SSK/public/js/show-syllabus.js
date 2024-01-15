document.addEventListener('click', async function(event) {
    if (event.target.matches('.syllabus')) {
      event.preventDefault(); // デフォルトのリンク先への遷移をキャンセル
      const response = await fetch('/getSyllabusUrl'); // シラバスのURLを取得
      const data = await response.json();
      const syllabusUrl = data.syllabusUrl;
      window.open(syllabusUrl, '_blank'); // シラバスのURLを新しいタブで開く
    }
  });