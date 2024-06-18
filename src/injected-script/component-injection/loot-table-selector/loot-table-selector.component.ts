import { Component, ElementRef, QueryList, ViewChildren, inject } from '@angular/core';
import {MatMenu, MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import {MatSelectModule} from '@angular/material/select';
import {OverlayModule} from '@angular/cdk/overlay';
import { LootService } from '../services/loot.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon'
import { WorldService } from '../services/world.service';
import { StateService, isCharacter, isHandout } from '../../firebase-server/state.service';
import { createItem } from '../../../injected-script';
import { CreateItemRequest, InventoryItem, UpdateHandoutRequest, UpdateSingleFieldRequest } from '../../item-creation/item.model';
import { getCharacterData, getHandoutData } from '../../intercepted-web-socket';
import { forkJoin, map, merge, switchMap, take, tap } from 'rxjs';
import { MaterializedLootItem } from '../models/materialized-loot-source.model';
import { FieldResponse } from '../../firebase-server/types';

@Component({
  selector: 'app-loot-table-selector',
  standalone: true,
  imports: [MatButtonModule, MatMenuModule, MatSelectModule, OverlayModule, CommonModule, MatIconModule],
  templateUrl: './loot-table-selector.component.html',
  styleUrl: './loot-table-selector.component.scss'
})
export class LootTableSelectorComponent {

  @ViewChildren('lootSourceRef', { read: ElementRef }) lootSourceMenus!: QueryList<MatMenu>;
  public lootService = inject(LootService);
  public worldService = inject(WorldService);

  materializeLootSource(lootSourceId: string, targetId: string){
    if (isCharacter(targetId)){
      return this.materializeLootSourceIntoCharacter(lootSourceId, targetId);
    }

    if (isHandout(targetId)){
      return this.materializeLootSourceIntoHandout(lootSourceId, targetId);
    }
    console.error(`Item with id ${targetId} is not either a character or handount`)
  }


  materializeLootSourceIntoHandout(lootSourceId: string, handoutId: string) {
    forkJoin([
      getHandoutData(handoutId),
      this.worldService.getMaterializeLoot(lootSourceId, '3d6')
    ])
    .subscribe(([handoutDetails, lootSource]) => {
      const htmlEl = document.createElement('html');
      htmlEl.innerHTML = handoutDetails.text;
      let textToAppend = '';
      const existingItems = Array.from(htmlEl.querySelectorAll('p'));

      lootSource.materializedLootItems.forEach(lootItem => {
        const existingItem = existingItems.find(p => p.dataset["externalId"] == lootItem.id);
        existingItems.forEach(p => console.log("dataset", p.dataset));
        if (!existingItem) {
          textToAppend += this.itemToHtml(lootItem);
        } else {
          const countLiElement = existingItem.querySelector('i.qdshun-count');
          if (!countLiElement){
            alert('Malformed html in this handout!');
            return;
          }
          countLiElement.innerHTML = (+(countLiElement.innerHTML ?? "0") + lootItem.count).toString()
        }
      })
      var updateHandoutRequest = new UpdateHandoutRequest();
      updateHandoutRequest.handoutId = handoutId;
      updateHandoutRequest.newValue = htmlEl.outerHTML + textToAppend;
      createItem(updateHandoutRequest);
    })
  }

  materializeLootSourceIntoCharacter(lootSourceId: string, characterId: string) {
    forkJoin([
      getCharacterData(characterId),
      this.worldService.getMaterializeLoot(lootSourceId, '3d6')
    ])
    .subscribe(([characterDetails, lootSource]) => {
      lootSource.materializedLootItems.forEach(lootItem => {
        const allCharacterFields = Object.values(characterDetails.values).filter(f => f.name && f.current);
        const existingItemNotesField = allCharacterFields.find(f =>  f.name.includes('_notes') && !f.name.includes('toggle_notes') && f.current.includes(lootItem.id));

        if (!existingItemNotesField){
          this.createNewItem(characterId, lootItem);
        } else {
          this.addCountToExistingItem(characterId, lootItem, existingItemNotesField, allCharacterFields);
        }
      });
    })
  }

  addCountToExistingItem(characterId: string, lootItem: MaterializedLootItem, notesfield: FieldResponse, fields: FieldResponse[]){
    //"repeating_item_-Ns3CE-eZV-6s8-KVi-_notes"
    //"repeating_item_-N0kVH-2kw-jmg-XMW-_count"
    const rowId = notesfield.name.substring(15,34);
    const countField = fields.find(f => f.name == `repeating_item_${rowId}_count`);
    if (!countField){
      console.error('Malformed item, found notes, but no count', lootItem);
      return;
    }
    var updateSingleFieldRequest = new UpdateSingleFieldRequest();
    updateSingleFieldRequest.characterId = characterId;
    updateSingleFieldRequest.field = countField;
    updateSingleFieldRequest.newValue = (+countField.current + lootItem.count).toString();
    createItem(updateSingleFieldRequest);
  }

  itemToHtml(lootItem: MaterializedLootItem){
    return `<p data-external-id="${lootItem.id}" class="qdshun-notes-paragraph" ">
        <i class="qdshun-count">${lootItem.count}</i>
        <i>${lootItem.name};</i>
        $<i>${lootItem.cost};</i>
        <i>${lootItem.weight}</i>lbs
        <br> <i>${lootItem.description}</i>
        </p>`;
  }

  createNewItem(characterId: string, lootItem: MaterializedLootItem){
    var createItemRequest = new CreateItemRequest();
    createItemRequest.characterId = characterId;
    createItemRequest.item = new InventoryItem(lootItem.name, '', lootItem.count, lootItem.cost, lootItem.weight, this.getItemIdentifier(lootItem.id) + lootItem.description);
    createItem(createItemRequest);
  }

  isCharacter(id: string){
    return isCharacter(id);
  }

  private getItemIdentifier(id: string){
    return `id: ${id}\\n`
  }
}
