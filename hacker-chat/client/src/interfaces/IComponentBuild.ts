import Blessed from 'blessed';

export default interface IComponentBuild {
    screen: Blessed.Widgets.Screen | undefined,
    chat: Blessed.Widgets.ListElement | undefined,
    input: Blessed.Widgets.TextareaElement | undefined,
    status: Blessed.Widgets.ListElement | undefined;
    activityLog: Blessed.Widgets.ListElement | undefined;
}
