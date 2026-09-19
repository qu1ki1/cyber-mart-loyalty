interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}


interface TelegramWebApp {

  ready(): void;

  expand(): void;

  close(): void;


  setHeaderColor(
    color:string
  ):void;


  setBackgroundColor(
    color:string
  ):void;


  initDataUnsafe:{
    user?: TelegramUser;
  };


  HapticFeedback:{
    impactOccurred(
      style:
      "light" |
      "medium" |
      "heavy" |
      "rigid" |
      "soft"
    ):void;


    notificationOccurred(
      type:
      "error" |
      "success" |
      "warning"
    ):void;


    selectionChanged():void;
  };

}



interface Window {

  Telegram:{
    WebApp:TelegramWebApp;
  };

}