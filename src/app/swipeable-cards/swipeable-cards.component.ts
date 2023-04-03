import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FactCard, Direction, GestureState, CardStatus } from '../types';

import {
  GestureHandlerStateEvent as NSGestureHandlerStateEvent,
  GestureHandlerTouchEvent as NSGestureHandlerTouchEvent,
  GestureStateEventData as NSGestureStateEventData,
  GestureTouchEventData as NSGestureTouchEventData,
  HandlerType as NSHandlerType,
  Manager as NSManager,
} from '@nativescript-community/gesturehandler';
import { CoreTypes, View, isIOS, Screen } from '@nativescript/core';

@Component({
  selector: 'swipeable-cards',
  templateUrl: './swipeable-cards.component.html',
  styleUrls: ['./swipeable-cards.component.css'],
})
export class SwipeableCardsComponent implements OnInit {
  @ViewChild('gestureRootView') gestureRootView: ElementRef;
  @ViewChild('cardContainer') cardContainer: ElementRef;

  @Input('dataCard') dataCard: FactCard[] = [];

  cards$: FactCard[]; 
  currentView$: number;
  gestureHandler = null;
  cardViews = 0;

  constructor() {}

  ngOnInit(): void {
    this.cards$ = this.dataCard.reverse();
    this.currentView$ = this.cards$.length - 1;
  }

  manager = NSManager.getInstance();

  private getGestureHandler = () => {
    console.log('Get gesture handler');

    this.gestureHandler = this.manager.createGestureHandler(
      NSHandlerType.PAN,
      this.cardViews++
    );

    this.gestureHandler.on(NSGestureHandlerTouchEvent, (args) =>
      this.onGestureTouch(args)
    );
    this.gestureHandler.on(NSGestureHandlerStateEvent, (args) =>
      this.onGestureState(args)
    );
    return this.gestureHandler;
  };

  onGestureTouch(args: NSGestureTouchEventData) {
    console.log('On Gesture Touch');
    const { state, extraData, view } = args.data;
    if (view) {
      view.translateX = extraData.translationX;
      view.translateY =
        extraData.translationY + this.getTranslateY(this.currentView$);
      view.rotate = extraData.translationX * (isIOS ? 0.05 : 0.1);
    }
    if(state !== GestureState.END){
      this.cards$[this.currentView$].status = extraData.translationX == 0 ? CardStatus.Front :  extraData.translationX > 0 ? CardStatus.ToExitRight : CardStatus.ToExitLeft;
    }
  }

  private getScale = (index: number) =>
    this.normalizeRange(this.currentPosition(index), this.cards$.length, 0);

  private getTranslateY = (index: number) =>
    this.normalizeRange(this.currentPosition(index), 0, this.cards$.length) *
    300;

  private normalizeRange = (val: number, max: number, min: number) =>
    (val - min) / (max - min);
  private currentPosition = (index: number) =>
    this.cards$.length - this.currentView$ + index;
  private isFirstCard = (index: number) => index === this.cards$.length - 1;
  private hasMoreCards = () => this.currentView$ >= 0;
  like = () => this.outCard(this.cards$[this.currentView$], Direction.Right);
  discard = () => this.outCard(this.cards$[this.currentView$], Direction.Left);

  private outCard(card: FactCard, direction: Direction) {
    console.log('Out card');

    if (this.hasMoreCards()) {
      const width = (card.view.getActualSize().width / 2) + Screen.mainScreen.widthDIPs;
      card.view.animate({
        rotate: direction === Direction.Left ? -40 : 40,
        translate: {
          x: direction === Direction.Left ? -width : width,
          y: 100,
        },
        duration: 250,
      });
      this.gestureHandler.detachFromView();
      card.status = Direction.Left ? CardStatus.ExitLeft : CardStatus.ExitRight;
      this.currentView$ = this.currentView$ - 1;
      if (this.currentView$ >= 0) {
        this.getGestureHandler().attachToView(
          this.cards$[this.currentView$].view
        );
        this.applyTranslateY();
      } else {
        //finish
      }
    }
  }

  private applyTranslateY() {
    console.log('Apply translate Y');

    for (let index = 0; index < this.currentView$ + 1; index++) {
      const card = this.cards$[index];
      if (index <= this.currentView$) {
        card.view.animate({
          translate: {
            y: this.getTranslateY(index),
            x: 0,
          },
          scale: {
            x: this.getScale(index),
            y: this.getScale(index),
          },
          duration: 250,
        });
      }
    }
  }

  private resetCard(card: FactCard, indexView: number) {
    console.log('Reset card');

    card.view.animate({
      rotate: 0,
      translate: {
        x: 0,
        y: this.getTranslateY(indexView),
      },
      scale: {
        x: this.getScale(indexView),
        y: this.getScale(indexView),
      },
      duration: 250,
      curve: CoreTypes.AnimationCurve.cubicBezier(0.17, 0.89, 0.24, 1.20),
    });
  }

  private onGestureState(args: NSGestureStateEventData) {
    console.log('On Gesture state');

    const { state, prevState, extraData, view } = args.data;
    if (state === GestureState.END) {
      const card = this.cards$[this.currentView$];
      const limitOffset = (Screen.mainScreen.widthDIPs / 2) 
      if (extraData.translationX >= limitOffset || extraData.translationX <= -limitOffset) {
        this.outCard(
          card,
          extraData.translationX >= limitOffset ? Direction.Right : Direction.Left
        );
      } else {
        this.resetCard(card, this.currentView$);
        card.status =  CardStatus.Front;
      }
    }
  }

  resetAllCard() {
    console.log('Reset all cards');

    this.currentView$ = this.cards$.length - 1;
    this.cards$.forEach((card: FactCard, index) => {
      this.resetCard(card, index);
      card.status = CardStatus.Back;
      if (this.isFirstCard(index)) {
        card.status = CardStatus.Front;
        this.getGestureHandler().attachToView(card.view);
      }
    });
  }

  loadedCard(args: { object: View }, index: number) {
    console.log('loadedCard');
    if (!this.cards$[index].view) {
      this.cards$[index].view = args.object;
      args.object.scaleY = this.getScale(index);
      args.object.scaleX = this.getScale(index);
      if (this.isFirstCard(index)) {
        this.getGestureHandler().attachToView(args.object);
      }
    }
  }
}
