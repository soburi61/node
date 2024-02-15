import requests
from bs4 import BeautifulSoup
import json
import sys
from get_kosen_url import get_kosen_url 

#学科の名前一覧を返す
def get_department_names(kosen):
    kosen_url=get_kosen_url(kosen)
    # HTMLを取得
    try:
        res = requests.get(kosen_url)
        res.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"URL: {kosen_url} へのリクエスト中にエラーが発生しました: {e}")
        return []
    kosen_soup = BeautifulSoup(res.content, "html.parser")
    # 学科名を含む要素を探す
    department_names = kosen_soup.findAll("h4")
    if not department_names:
        print(f"学科名が見つかりませんでした。")
        return []
    else:
        # BeautifulSoupオブジェクトからテキストを抽出してリストに格納
        return [dept.get_text() for dept in department_names]
    


if __name__ == "__main__":
    # コマンドライン引数を取得
    args = sys.argv[1:]  # 最初の引数はファイル名なので除外

    # 引数が3つであることを確認
    if len(args) != 1:
        print("引数は1つです: 学校名")
        sys.exit(1)

    names = get_department_names(args[0])
    print(json.dumps(names))