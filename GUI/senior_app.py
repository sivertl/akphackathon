from kivy.app import App
from kivy.uix.boxlayout import BoxLayout

class MyLayout(BoxLayout):
    def printMe(self_xx, yy):
        print(yy)

class senior_app(App): 
    def build(self):
        self.load_kv('myapp.kv')
        return MyLayout()

senior_app().run()