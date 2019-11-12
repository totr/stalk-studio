import React from 'react';
import { Select } from 'antd';
import DataSourceManager, { DataSourceManagerEvent } from '../../model/datasource/manager';
import { DataSource, DataSourceType } from '../../model/datasource/interfaces';

const { Option } = Select;


export interface DataSourceSelectProps {
  style?: React.CSSProperties,
  onChange: (dataSource: DataSource | null) => void,
  value?: DataSource,
  hideJsonFiles?: boolean
}


export class DataSourceSelect extends React.Component<DataSourceSelectProps> {
  private dsManager = DataSourceManager.getSingleton();
  private currentValue: any = null;
  state = {
    dataSources: this.dsManager.getAll().filter((ds) => {
      if (!this.props.hideJsonFiles) return true;
      return ds.type == DataSourceType.ZIPKIN || ds.type == DataSourceType.JAEGER;
    })
  };
  binded = {
    onChange: this.onChange.bind(this),
    onDataSourceManagerUpdated: this.onDataSourceManagerUpdated.bind(this),
  };


  componentDidMount() {
    this.dsManager.on(DataSourceManagerEvent.UPDATED, this.binded.onDataSourceManagerUpdated);
  }


  componentWillUnmount() {
    this.dsManager.removeListener(DataSourceManagerEvent.UPDATED, this.binded.onDataSourceManagerUpdated);
  }


  onDataSourceManagerUpdated() {
    const dataSources = this.dsManager.getAll().filter((ds) => {
      if (!this.props.hideJsonFiles) return true;
      return ds.type == DataSourceType.ZIPKIN || ds.type == DataSourceType.JAEGER;
    });
    this.setState({ dataSources });
    if (this.currentValue && dataSources.indexOf(this.currentValue) === -1) {
      this.props.onChange(null);
      this.forceUpdate();
    }
  }


  onChange(value: any) {
    this.currentValue = value;
    this.props.onChange(this.dsManager.get(value)!);
  }


  render() {
    const conditionalProps = this.props.value ? {value: this.props.value.id} : {};

    return (
      <Select
        showSearch
        optionFilterProp="children" // Filter by datasource name
        {...conditionalProps}
        onChange={this.binded.onChange}
        placeholder="Select a data source"
        style={this.props.style || {}}
      >
        {this.state.dataSources.map((datasource) => (
          <Option key={datasource.id}>{datasource.name}</Option>
        ))}
      </Select>
    );
  }
}


export default DataSourceSelect;
