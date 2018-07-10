const React = require('react');
const Table = require('react-table').default;

class TableComponent extends React.PureComponent {
  getColumns() {
    if (this.props.columns) {
      if (this.props.columns.length && typeof this.props.columns[0] === 'string') {
        return this.props.columns.map((d) => {
          return {
            Header: d,
            accessor: d
          };
        })
      }

      return this.props.columns;
    }
    if ((this.props.data || []).length) {
      return Object.keys(this.props.data[0]).map((d) => {
        return {
          Header: d,
          accessor: d
        }
      })
    }

    return [];
  }
  render() {
    return (
      <Table
        className={`table ${this.props.className || ''}`}
        showPagination={this.props.data.length > this.props.defaultPageSize}
        minRows={this.props.data.length <= this.props.defaultPageSize ? this.props.data.length : undefined}
        {...this.props}
        children={undefined}
        columns={this.getColumns()}
         />
    );
  }
}

TableComponent.defaultProps = {
  data: [],
  showPageSizeOptions: false,
  showPageJump: false,
  defaultPageSize: 20
}

TableComponent._idyll = {
  name: "Table",
  tagType: "closed",
  props: [{
    name: "data",
    type: "array",
    example: 'x'
  }, {
    name: "showPagination",
    type: "boolean",
    example: 'false'
  }, {
    name: "showPageSizeOptions",
    type: "boolean",
    example: 'false'
  }, {
    name: "showPageJump",
    type: "boolean",
    example: 'false'
  }]
}

export default TableComponent;
