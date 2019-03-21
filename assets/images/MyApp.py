# Uses tkinter to plot background image

from kivy.app import App

class MainApp(App):
    def build(self):
        self.load_kv('my.kv')
        return RootScreen()

if __name__ == "__main__":
    MainApp().run()