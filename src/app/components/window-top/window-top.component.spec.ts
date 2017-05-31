import {
  inject,
  async,
  TestBed,
  ComponentFixture
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { WindowTopComponent } from './window-top.component';
import { AppModule } from '../../app.module';

describe(`WindowTopComponent`, () => {
  let comp: WindowTopComponent;
  let fixture: ComponentFixture<WindowTopComponent>;
  let de: DebugElement;
  let el: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ AppModule ]
    }).compileComponents();
   }));

  it(`should be readly initialized`, async(() => {
    fixture = TestBed.createComponent(WindowTopComponent);
    comp = fixture.componentInstance;

    fixture.detectChanges();
    expect(fixture).toBeDefined();
    expect(comp).toBeDefined();
  }));

});
