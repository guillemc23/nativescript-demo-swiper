import {
  platformNativeScript,
  runNativeScriptAngularApp,
  registerElement,
} from '@nativescript/angular';

import { AppModule } from './app/app.module';
import {
  GestureRootView,
  install,
} from '@nativescript-community/gesturehandler';
import { CoreTypes, TouchManager } from '@nativescript/core';

install(false);
registerElement('GestureRootView', () => GestureRootView);

TouchManager.enableGlobalTapAnimations = true;
TouchManager.animations = {
  down: {
    scale: { x: 0.96, y: 0.96 },
    duration: 200,
    curve: CoreTypes.AnimationCurve.easeInOut,
  },
  up: {
    scale: { x: 1, y: 1 },
    duration: 200,
    curve: CoreTypes.AnimationCurve.easeInOut,
  },
};

runNativeScriptAngularApp({
  appModuleBootstrap: () => platformNativeScript().bootstrapModule(AppModule),
});
