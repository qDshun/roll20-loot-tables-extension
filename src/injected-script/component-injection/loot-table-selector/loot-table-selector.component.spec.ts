import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LootTableSelectorComponent } from './loot-table-selector.component';

describe('LootTableSelectorComponent', () => {
  let component: LootTableSelectorComponent;
  let fixture: ComponentFixture<LootTableSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LootTableSelectorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LootTableSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
