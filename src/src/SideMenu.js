import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import IconButton from '@material-ui/core/IconButton';
import {DragDropContext, Droppable, Draggable} from 'react-beautiful-dnd';

import {MdFolder as IconFolder} from 'react-icons/md';
import {MdDelete as IconDelete} from 'react-icons/md';
import {MdDragHandle as IconGrip} from 'react-icons/md';
import {MdExpandMore as IconExpand} from 'react-icons/md';
import {MdExpandLess as IconCollapse} from 'react-icons/md';
import {MdPlayArrow as IconPlay} from 'react-icons/md';
import {MdAdd as IconAdd} from 'react-icons/md';
import {MdPause as IconPause} from 'react-icons/md';
import {MdSwapVert as IconReorder} from 'react-icons/md';
import {MdEdit as IconEdit} from 'react-icons/md';
import {MdRefresh as IconRestart} from 'react-icons/md';

import ImgJS from './assets/js.png';
import ImgBlockly from './assets/blockly.png';
import ImgTypeScript from './assets/typescript.png';

import Theme from './Theme';
import I18n from './i18n';
import DialogRename from './Dialogs/Rename';
import DialogDelete from './Dialogs/Delete';
import DialogAddNewScript from './Dialogs/AddNewScript';
import DialogNew from './Dialogs/New';

import data from './data';

const styles = theme => ({
    drawerPaper: {
        position: 'relative',
        width: Theme.menu.width,
    },
    toolbar: theme.mixins.toolbar,
    toolbarButtons: {
        marginTop: 8
    },
    menu: {
        width: '100%',
        height: '100%'
    },
    innerMenu: {
        width: '100%',
        height: '100%',
        overflowX: 'hidden',
        overflowY: 'auto'
    },
    scriptIcon: {
        width: 18,
        height: 18
    },
    gripHandle: {
        paddingRight: 13
    },
    noGripHandle: {
        width: 29
    },
    folder: {
        background: '#e2e2e2',
        cursor: 'pointer',
        padding: 0,
        userSelect: 'none'
    },
    element: {
        cursor: 'pointer',
        padding: 0,
        userSelect: 'none'
    },
    reorder: {
        padding: '9px 16px 9px 9px',
    },
    expandButton: {
        width: 37,
        height: 37
    },
    selected: Theme.colors.selected
});

const images = {
    'Blockly': ImgBlockly,
    'Javascript/js': ImgJS,
    def: ImgJS,
    'TypeScript/ts': ImgTypeScript,
};

const getItemStyle = (isDragging, draggableStyle) => ({
    userSelect: 'none',
    background: isDragging ? 'lightgreen' : 'inherit',
    ...draggableStyle,
});

const getObjectName = (id, obj, lang) => {
    lang = lang || I18n.getLanguage();
    if (obj && obj.common && obj.common.name) {
        if (typeof obj.common.name === 'object') {
            return obj.common.name[lang] || obj.common.name.en;
        } else {
            return obj.common.name;
        }
    } else {
        return id.replace(/^script\.js./, '');
    }
};

const prepareList = data => {
    const result = [];
    const ids = Object.keys(data);
    ids.sort((a, b) => {
        if ((a === 'script.js.common' || a === 'script.js.global') && (b === 'script.js.common' || b === 'script.js.global')) {
            return a > b ? 1 : -1;
        } else if (a === 'script.js.common' || a === 'script.js.global' || b === 'script.js.common' || b === 'script.js.global') {
            return 1;
        } else {
            return a > b ? 1 : -1;
        }
    });

    for (let i = 0; i < ids.length; i++) {
        const obj = data[ids[i]];
        const parts = ids[i].split('.');
        parts.pop();
        result.push({
            id:         ids[i],
            index:      i,
            title:      getObjectName(ids[i], obj, 'de'),
            enabled:    obj && obj.common && obj.common.enabled,
            depth:      parts.length - 2,
            type:       obj.type === 'script' ? obj.common.engineType : 'folder',
            parent:     parts.length > 2 ? parts.join('.') : null
        });

    }
    return result;
};

class SideDrawer extends React.Component {
    constructor(props) {
        super(props);

        let expanded = window.localStorage.getItem('SideMenu.expanded');
        try {
           expanded =  JSON.parse(expanded) || [];
        } catch (e) {
            expanded = [];
        }

        this.state = {
            listItems: prepareList(data),
            expanded: expanded,
            reorder: false,
            selected: window.localStorage.getItem('SideMenu.selected') || null,
            renaming: null,
            deleting: null,
            choosingType: null,
        };
    }

    saveExpanded(expanded) {
        window.localStorage.setItem('SideMenu.expanded', JSON.stringify(expanded || this.state.expanded));
    }

    onExpand(id) {
        if (this.state.expanded.indexOf(id) === -1) {
            const expanded = this.state.expanded.concat([id]);
            this.setState({expanded});
            this.saveExpanded(expanded);
        }
    }

    onCollapse(id) {
        const pos = this.state.expanded.indexOf(id);
        if (pos !== -1) {
            const expanded = this.state.expanded.concat([]);
            expanded.splice(pos, 1);
            this.setState({expanded});
            this.saveExpanded(expanded);
        }
    }

    onDragEnd(result) {
        // dropped outside the list
        if (!result.destination) {
            return;
        }

        /*const items = reorder(
            this.state.items,
            result.source.index,
            result.destination.index
        );

        this.setState({
            items,
        });*/
    }

    onDragUpdate = (update, provided) => {
        console.log(update);
    };

    renderItemButtons(item, children) {
        if (this.state.reorder) return null;
        if (children && children.length) {
        } else {
            return [
                item.type !== 'folder' ? (
                    <IconButton onClick={() => this.props.onEnableDisable && this.props.onEnableDisable(!item.enabled)} style={{color: item.enabled ? '#589458' : 'red'}}>
                        {item.enabled ? (<IconPause/>) : (<IconPlay/>)}
                    </IconButton>
                ) : null,
                item.id !== 'script.js.common' && item.id !== 'script.js.global' ? (<IconButton><IconDelete onClick={() => this.onDelete(item)}/></IconButton>) : null
            ];
        }
    }

    onDelete(item) {
        this.setState({deleting: item.id});
    }

    renderFolderButtons(item, children) {
        if (this.state.reorder) {
            if (item.type !== 'folder') {
                return (<IconGrip className={this.props.classes.gripHandle}/>);
            } else {
                return (<div className={this.props.classes.noGripHandle}/>);
            }
        }
        if (children && children.length) {
            const isExpanded = this.state.expanded.indexOf(item.id) !== -1;
            return (
                <IconButton className={this.props.classes.expandButton} onClick={isExpanded ? () => this.onCollapse(item.id) : () => this.onExpand(item.id)}>
                    {this.state.expanded.indexOf(item.id) !== -1 ?
                        (<IconCollapse fontSize="small"/>) : (<IconExpand fontSize="small"/>)}
                </IconButton>
            );
        } else {
            return (<div className={this.props.classes.expandButton}/>);
        }
    }

    getTextStyle(item) {
        if (!this.state.reorder && item.type !== 'folder') {
            return {
                width: 130,
                overflow: 'hidden',
                flex: 'none',
                padding: '0 16px 0 0'
            };
        } else {
            return {
                padding: '0 16px 0 0'
            };
        }
    }

    onClick(item) {
        if (!this.state.reorder) {
            this.setState({selected: item.id});
            window.localStorage.setItem('SideMenu.selected', item.id);
            this.props.onSelect && this.props.onSelect(item.id);
        }
    }

    renderOneItem(items, item) {
        let children = items.filter(i => i.parent === item.id);

        const inner = (
            <ListItem
                style={Object.assign({
                    paddingLeft: (this.state.reorder ? 8 : 0) + item.depth * Theme.menu.depthOffset,
                    cursor: item.type === 'folder' && this.state.reorder ? 'default': 'inherit'
                }, item.id === this.state.selected ? Theme.colors.selected : {})}
                className={(item.type === 'folder' ? this.props.classes.folder : this.props.classes.element) + ' ' + (this.state.reorder ? this.props.classes.reorder : '')}
                onClick={() => this.onClick(item)}
            >
                {this.renderFolderButtons(item, children)}
                <ListItemIcon>{item.type === 'folder' ? (<IconFolder />) : (<img className={this.props.classes.scriptIcon} src={images[item.type] || images.def}/>)}</ListItemIcon>
                <ListItemText classes={{primary: item.id === this.state.selected ? this.props.classes.selected : undefined}}style={this.getTextStyle(item)} primary={item.title} secondary={null}/>
                <ListItemSecondaryAction>{this.renderItemButtons(item, children)}</ListItemSecondaryAction>
            </ListItem>
        );

        const result = [this.state.reorder && item.type !== 'folder' ? (
            <Draggable key={item.id} draggableId={item.id} index={item.index}>
                {(provided, snapshot) => (
                    <div ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={getItemStyle(
                                snapshot.isDragging,
                                provided.draggableProps.style
                            )}>
                        {inner}
                    </div>
                )}
            </Draggable>) : inner];

        if (children && (this.state.reorder || this.state.expanded.indexOf(item.id) !== -1)) {
            children.forEach(it => result.push(this.renderOneItem(items, it)));
        }
        return result;
    }

    renderAllItems(items, dragging) {
        const result = [];
        items.forEach(item => !item.parent && result.push(this.renderOneItem(items, item, dragging)));

        return (<List dense={true}>{result}</List>);
    }

    onAddNew() {
        let item = this.state.listItems.find(i => i.id === this.state.selected);
        let parent = 'script.js';
        while(item && item.type !== 'folder') {
            item = this.state.listItems.find(i => i.id === item.parent);
        }
        if (item) {
            parent = item.id;
        }

        this.parent = parent;
        this.setState({choosingType: true});
    }

    onRename() {
        this.setState({renaming: this.state.selected});
    }

    getUniqueName() {
        let i = 1;
        while(this.state.listItems.find(i => i.id === this.parent + '.' + I18n.t('Script') + '_' + i)) {
            i++;
        }
        return I18n.t('Script') + ' ' + i;
    }

    render() {
        const {classes} = this.props;

        return [(
            <Drawer
                variant="permanent"
                className={classes.menu}
                classes={{paper: classes.drawerPaper}}
                anchor='left'
            >
                <div className={classes.toolbar}>
                    {!this.state.reorder ? (<IconButton
                        className={classes.toolbarButtons}
                        style={{color: this.state.reorder ? 'red' : 'inherit'}}
                        onClick={() => this.onAddNew()}
                    ><IconAdd/></IconButton>) : null}
                    <IconButton
                        className={classes.toolbarButtons}
                        style={{color: this.state.reorder ? 'red' : 'inherit', float: 'right'}}
                        onClick={() => this.setState({reorder: !this.state.reorder})}
                    >
                        <IconReorder/>
                    </IconButton>
                    {!this.state.reorder && this.state.selected && this.state.selected !== 'script.js.global' && this.state.selected !== 'script.js.common' ? [
                            (<IconButton className={classes.toolbarButtons} onClick={() => this.onRename()}><IconEdit  /></IconButton>),
                            (<IconButton className={classes.toolbarButtons} onClick={() => this.props.onEnableDisable && this.props.onEnableDisable()}><IconRestart /></IconButton>)
                        ]
                    : null}
                </div>
                <Divider/>
                <DragDropContext
                    onDragEnd={this.onDragEnd}
                    onDragUpdate={this.onDragUpdate}
                >
                    <Droppable droppableId="droppable">
                        {(provided, snapshot) => (
                            <div ref={provided.innerRef}
                                 //style={getListStyle(snapshot.isDraggingOver)}
                                 className={classes.innerMenu}>
                                {this.renderAllItems(this.state.listItems)}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>

            </Drawer>),
            this.state.renaming ? (<DialogRename
                name={this.state.listItems.find(i => i.id === this.state.renaming).title}
                id={this.state.renaming}
                onClose={() => this.setState({renaming: false})}
                onRename={(oldId, newName, newId) => this.props.onRename && this.props.onRename(oldId, newName, newId)}
            />) : null,
            this.state.deleting ? (<DialogDelete
                name={this.state.listItems.find(i => i.id === this.state.deleting).title}
                id={this.state.deleting}
                onClose={() => this.setState({deleting: false})}
                onDelete={id => this.props.onDelete && this.props.onDelete(id)}
            />) : null,
            this.state.choosingType ? (<DialogAddNewScript
                onClose={type => {
                    this.setState({choosingType: false});
                    type && this.setState({creating: type})
                }}
            />) : null,
            this.state.creating ? (<DialogNew
                onClose={() => this.setState({creating: false})}
                title={I18n.t('Create new script')}
                name={this.getUniqueName()}
                parent={this.parent}
                onAdd={(id, name) => this.props.onAddNew && this.props.onAddNew(id, name)}
            />) : null
        ];
    }
}

SideDrawer.propTypes = {
    classes: PropTypes.object.isRequired,
    objects: PropTypes.object.isRequired,
    onEnableDisable: PropTypes.func,
    onSelect: PropTypes.func,
    onAddNew: PropTypes.func,
    onRename: PropTypes.func,
    onDelete: PropTypes.func,
};

export default withStyles(styles)(SideDrawer);
