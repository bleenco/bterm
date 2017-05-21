import {
  inject,
  async,
  TestBed,
  ComponentFixture
} from '@angular/core/testing';

import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { WindowTopComponent } from './window-top.component';

import { XtermService } from '../../services/xterm.service';
import { ConfigService } from '../../services/config.service';

describe(`WindowTopComponent`, () => {
  let comp: WindowTopComponent;
  let fixture: ComponentFixture<WindowTopComponent>;
  let de: DebugElement;
  let el: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WindowTopComponent ],
      providers: [
        XtermService,
        ConfigService
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WindowTopComponent);
    comp = fixture.componentInstance;
  });

  it(`should be readly initialized`, () => {
    fixture.detectChanges();
    expect(fixture).toBeDefined();
    expect(comp).toBeDefined();
  });

});
