import { NativeModulesProxy, EventEmitter, EventSubscription } from 'expo-modules-core';

// Import the native module. On web, it will be resolved to MyModule.web.ts
// and on native platforms to MyModule.ts
import MyModule from './src/MyModule';
import MyModuleView from './src/MyModuleView';
import { ChangeEventPayload, MyModuleViewProps } from './src/MyModule.types';

// Get the native constant value.
export const PI = MyModule.PI;

export function hello(): string {
  return MyModule.hello();
}

export async function setValueAsync(value: string) {
  return await MyModule.setValueAsync(value);
}

interface ModuleEvents {
  onChange: ChangeEventPayload;
}

const emitter = new EventEmitter<ModuleEvents>(MyModule ?? NativeModulesProxy.MyModule);

export function addChangeListener(listener: (event: ChangeEventPayload) => void): EventSubscription {
  return emitter.addListener('onChange', listener);
}

export { MyModuleView, MyModuleViewProps, ChangeEventPayload };
