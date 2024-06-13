import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild, inject } from '@angular/core';
import {MatMenuModule, MatMenuTrigger} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import {MatSelectModule} from '@angular/material/select';
import { fromEvent, mergeMap, takeUntil } from 'rxjs';
import { Overlay, OverlayRef, PositionStrategy } from '@angular/cdk/overlay';
import {OverlayModule} from '@angular/cdk/overlay';
import { LootService } from '../services/loot.service';

@Component({
  selector: 'app-loot-table-selector',
  standalone: true,
  imports: [MatButtonModule, MatMenuModule, MatSelectModule, OverlayModule],
  templateUrl: './loot-table-selector.component.html',
  styleUrl: './loot-table-selector.component.scss'
})
export class LootTableSelectorComponent implements OnInit {

  lootService = inject(LootService);
  constructor () {
  }

  ngOnInit(): void {

    fromEvent(document, 'click').pipe(
    ).subscribe(() =>
      this.lootService.test())


    const targetElement = document.getElementById('buttonSpecial');
    console.log(targetElement);
    if (targetElement){
      const mouseEnter$ = fromEvent(targetElement, 'mouseenter');
      const mouseLeave$ = fromEvent(targetElement, 'mouseleave');
      mouseEnter$.subscribe(() => console.log('mouse enter'))
      const click$ = fromEvent(document, 'click');
      mouseEnter$
        .pipe(
          mergeMap(() => click$.pipe(takeUntil(mouseLeave$)))
        )
        .subscribe((event: any) => {
          console.log('Click captured:', event);
        });

    }

// Observable for mouseenter event on the target element

// When mouse enters the target element, start listening to click events until mouse leaves the element

    document.getElementById('#buttonSpecial')?.addEventListener('click', (event) => {

      console.log('Click triggered');
      console.log('Click triggered');
      console.log('Click triggered');
      console.log(event);

    }, true)
  }
}
