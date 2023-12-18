import requests
from bs4 import BeautifulSoup
import re
import json
import sys
from get_subjects import get_department_page 

#学科の名前一覧を返す
def get_department_names(kosen):
    kosen_soup=get_department_page(kosen)
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