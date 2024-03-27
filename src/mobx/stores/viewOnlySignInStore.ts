import { action, observable } from "mobx";
import { AddressResolver } from "mobx/stores/addressResolver";

export class ViewOnlySignInStore extends AddressResolver {
  @observable value = "";

  @action.bound
  public setValue(value: string): void {
    this.value = value;
    this.setAddressOrStarname(value);
  }
}
