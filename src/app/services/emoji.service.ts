import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EmojiService {

  constructor() { 
  }

  public createEmoji = (selection: any) => {
    return selection.append('text').text('\u2764\uFE0F');
  }
}
