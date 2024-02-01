import numpy as np
import skfuzzy as fuzz
from skfuzzy import control as ctrl
import matplotlib.pyplot as plt
import datetime
import os


#--定義--
# 重要度、締切日（日付）、タスクの軽さを入力変数とします
importance = ctrl.Antecedent(np.arange(0, 11, 1), 'importance')
lightness = ctrl.Antecedent(np.arange(0, 11, 1), 'lightness')
deadline = ctrl.Antecedent(np.arange(0, 61, 1), 'deadline')


# 優先度を出力変数とします
priority = ctrl.Consequent(np.arange(0, 101, 1), 'priority')

# 各変数のファジィ集合を定義します
importance['low'] = fuzz.trimf(importance.universe, [0, 0, 5])
importance['medium'] = fuzz.trimf(importance.universe, [0, 5, 10])
importance['high'] = fuzz.trimf(importance.universe, [5, 10, 10])

lightness['light'] = fuzz.trimf(lightness.universe, [0, 0, 5])
lightness['medium'] = fuzz.trimf(lightness.universe, [0, 5, 10])
lightness['heavy'] = fuzz.trimf(lightness.universe, [5, 10, 10])

deadline['near'] = fuzz.trimf(deadline.universe, [0, 0, 15])
deadline['medium'] = fuzz.trimf(deadline.universe, [10, 30, 50])
deadline['far'] = fuzz.trimf(deadline.universe, [30, 60, 60])

priority['low'] = fuzz.trimf(priority.universe, [0, 0, 50])
priority['medium'] = fuzz.trimf(priority.universe, [0, 50, 100])
priority['high'] = fuzz.trimf(priority.universe, [50, 100, 100])

# ルールを定義
rule1 = ctrl.Rule(importance['low'] | deadline['far'] | lightness['light'], priority['low'])
rule2 = ctrl.Rule(importance['medium'] | deadline['medium'] | lightness['medium'], priority['medium'])
rule3 = ctrl.Rule(importance['high'] | deadline['near'] | lightness['heavy'], priority['high'])
rule4 = ctrl.Rule(deadline['near'] & lightness['heavy'], priority['high'])
# ルールを制御システムに追加
priority_ctrl = ctrl.ControlSystem([rule1, rule2, rule3])
#------



def calculate_priority(name, importance_value, lightness_value, deadline_date):


    # 制御システムをシミュレーションに接続します
    priority_eval = ctrl.ControlSystemSimulation(priority_ctrl)

    # 具体的な入力値を設定します
    priority_eval.input['importance'] = importance_value
    priority_eval.input['lightness'] = lightness_value
    # 締切日を日付または時間形式から数値に変換し、適切な値を設定します
    current_date = datetime.datetime.now()  # 現在の日付を取得
    days_until_deadline = (deadline_date - current_date).days
    # 2ヶ月以内の場合はスケーリング
    if days_until_deadline >= 60:
        days_until_deadline = 60  # 2ヶ月以上は60に設定
    priority_eval.input['deadline'] = days_until_deadline
    
    # 優先度を計算します
    priority_eval.compute()
    
    if debag:
        priority.view(sim=priority_eval)
        # グラフにタイトルを追加
        plt.title(f"{name}({priority_eval.output['priority']})")
        # グラフを表示
        plt.show()
        

    # 優先度を返します
    return priority_eval.output['priority']





if __name__ == "__main__":
    while True:
        choice = input("新しいタスクを追加しますか？(y/n):").lower()

        if choice != "y":
            break

        # ---------タスクの情報をユーザーから入力-------------
        name = input("タスクの名前: ")
        importance = int(input("重要度 (0から10の範囲): "))
        lightness = int(input("軽さ (0から10の範囲): "))
        current_year = datetime.datetime.now().year 
        if input("締切は今年ですか？(y/n): ").lower() == "y":
            year = current_year
        else:
            year=int(input("締め切り日の年(2022): "))
        month = int(input("締切日の月 (1から12): "))
        day = int(input("締切日の日 (1から31): "))
        # 時間を設定しますか？と聞き、nだったら11:59 PMにする
        time_set = input("終日にしますか？(y/n): ").lower()
        if time_set != "y":
            hour = int(input("時間 (0から23): "))
            minute = int(input("分 (0から59): "))
        else:
            hour = 23  # 11:59 PM
            minute = 59
        #------------------------------------------
        



