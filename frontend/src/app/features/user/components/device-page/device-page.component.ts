import {Component} from '@angular/core';
import {ApiUserService} from '../../../../api/services/api-user.service';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';
import {MatListItem, MatNavList} from '@angular/material/list';
import {MatMenu, MatMenuItem} from '@angular/material/menu';
import {AsyncPipe, NgIf} from '@angular/common';
import {ConfirmationService} from '../../../../shared/services/confirmation.service';
import {NotificationService} from '../../../notification/services/notification.service';
import {Token} from '@capacitor/push-notifications';

@Component({
  selector: 'app-device-page',
  imports: [
    MatIcon,
    MatIconButton,
    MatListItem,
    MatMenu,
    MatMenuItem,
    MatNavList,
    NgIf,
    AsyncPipe
  ],
  templateUrl: './device-page.component.html',
  styleUrl: './device-page.component.css'
})
export class DevicePageComponent {

  devices$;
  token: Token;

  constructor(private userApi: ApiUserService, private confirm: ConfirmationService, private notificationService: NotificationService) {
    this.devices$ = this.userApi.getRegisterDevices();
    this.token = this.notificationService.token;
  }


  deleteDevice(token: string) {
    this.confirm.confirm("Delete the device?").subscribe((result) => {
      if (result) {
        this.userApi.deleteDevice({token}).subscribe(() => {
            this.devices$ = this.userApi.getRegisterDevices();
          }
        )
      }
    })
  }


}
