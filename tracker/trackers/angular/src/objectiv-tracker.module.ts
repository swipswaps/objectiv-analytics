import { NgModule, ModuleWithProviders } from '@angular/core';
import { ObjectivTrackerDirective } from "./objectiv-tracker.directive";
import { ObjectivTrackerService } from './objectiv-tracker.service';

@NgModule({
  imports: [],
  declarations: [ObjectivTrackerDirective],
  exports: [],
})
export class ObjectivTrackerModule {
  static forRoot(): ModuleWithProviders<ObjectivTrackerService> {
    return {
      ngModule: ObjectivTrackerModule,
      providers: [ObjectivTrackerService],
    };
  }
}
