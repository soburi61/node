import requests
from bs4 import BeautifulSoup
import sys
from get_kosen_url import get_kosen_url 

def get_syllabus(kosen, department):
    url = "https://syllabus.kosen-k.go.jp"
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
    department_heading = kosen_soup.find("h4", string=department)
    if not department_heading:
        print(f"学科名 '{department}' が見つかりませんでした。")
        return []

    # 学科名が見つかった場合、その親要素を取得し、科目一覧のリンクを探す
    parent_div = department_heading.find_parent("div", class_="row")
    if not parent_div:
        print(f"学科名 '{department}' の親要素が見つかりませんでした。")
        return []
    department_anchor = parent_div.find("a", string="本年度の開講科目一覧")
    if not department_anchor:
        print(f"学科名 '{department}' の科目一覧リンクが見つかりませんでした。")
        return []
    department_url = url + department_anchor.get('href')
    return department_url

if __name__ == "__main__":
    # コマンドライン引数を取得
    args = sys.argv[1:]  # 最初の引数はファイル名なので除外

    # 引数が2つであることを確認
    if len(args) != 2:
        print("引数は2つです: 学校名 学科")
        sys.exit(1)

    # 個別の引数を抽出
    kosen, department = args

    # 関数を呼び出す
    url = get_syllabus(kosen, department)
    print(url)
