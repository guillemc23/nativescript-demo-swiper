import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptModule } from '@nativescript/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ItemsComponent } from './item/items.component';
import { ItemDetailComponent } from './item/item-detail.component';
import { SwipeableCardsComponent } from './swipeable-cards/swipeable-cards.component';

import { BottomSheetModule } from '@nativescript-community/ui-persistent-bottomsheet/angular';

// import { PBSModule } from "@nativescript-community/ui-persistent-bottomsheet/angular";


@NgModule({
  bootstrap: [AppComponent],
  imports: [NativeScriptModule, AppRoutingModule, BottomSheetModule],
  declarations: [
    AppComponent,
    ItemsComponent,
    SwipeableCardsComponent,
    ItemDetailComponent,
  ],
  providers: [],
  schemas: [NO_ERRORS_SCHEMA],
})
export class AppModule {}
