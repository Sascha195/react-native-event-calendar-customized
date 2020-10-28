import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import populateEvents from './Packer';
import React from 'react';
import moment from 'moment';
import _ from 'lodash';

const LEFT_MARGIN = 60 - 1;
// const RIGHT_MARGIN = 10
const CALENDER_HEIGHT = 2400;
// const EVENT_TITLE_HEIGHT = 15
const TEXT_LINE_HEIGHT = 17;
// const MIN_EVENT_TITLE_WIDTH = 20
// const EVENT_PADDING_LEFT = 4

function range(from, to) {
  return Array.from(Array(to), (_, i) => from + i);
}

export default class DayView extends React.PureComponent {
  constructor(props) {
    super(props);
    this.scrollViewRef = React.createRef();

    this.calendarHeight = (props.end - props.start) * 100;
    const width = props.width - LEFT_MARGIN;
    const packedEvents = populateEvents(props.events, width, props.start);
    let initPosition =
      _.min(_.map(packedEvents, 'top')) -
      this.calendarHeight / (props.end - props.start);
    initPosition = initPosition < 0 ? 0 : initPosition;
    this.state = {
      _scrollY: initPosition,
      packedEvents,
    };
  }

  componentDidMount() {
    this.scrollToFirst();
  }

  scrollToFirst() {
    setTimeout(() => {
      if (this.state && this.state._scrollY && this.scrollViewRef) {
        this.scrollViewRef.current.scrollTo({
          x: 0,
          y: this.state._scrollY,
          animated: true,
        });
      }
    }, 1);
  }

  _renderLines() {
    const { start, end } = this.props;
    const offset = this.calendarHeight / (end - start);

    return range(start, end + 1).map((i, index) => {
      let timeText;
      if (i === start) {
        timeText = ``;
      } else if (i < 10) {
        timeText = `0${i}:00`;
      } else if (i === 24) {
        timeText = '00:00';
      } else {
        timeText = `${i}:00`;
      }
      const { width, styles } = this.props;
      return [
        <Text
          key={`timeLabel${i}`}
          style={[styles.timeLabel, { top: offset * index - 6 }]}
        >
          {timeText}
        </Text>,
        i === start ? null : (
          <View
            key={`line${i}`}
            style={[styles.line, { top: offset * index, width: width - 20 }]}
          />
        ),
        <View
          key={`lineHalf${i}`}
          style={[
            styles.line,
            { top: offset * (index + 0.5), width: width - 20 },
          ]}
        />,
      ];
    });
  }

  _renderTimeLabels() {
    const { styles, start, end } = this.props;
    const offset = this.calendarHeight / (end - start);
    return range(start, end).map((item, i) => {
      return (
        <View key={`line${i}`} style={[styles.line, { top: offset * i }]} />
      );
    });
  }

  _onEventTapped(event) {
    this.props.eventTapped(event);
  }

  _renderEvents() {
    const { styles } = this.props;
    const { packedEvents } = this.state;
    let events = packedEvents.map((event, i) => {
      const style = {
        left: event.left,
        height: event.height,
        width: event.width,
        top: event.top,
      };

      return (
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() =>
            this._onEventTapped(this.props.events[event.index])
          }
          key={i} style={[styles.event, style, (event.gender === 'female' ? styles.eventFemale : styles.eventMale)]}
        >
          {(
            <View>
              <Text numberOfLines={1}>{event.title}</Text>
              <View>
                <Text numberOfLines={1}>{event.gender}</Text>
              </View>
            </View>
          )}
        </TouchableOpacity>
      );
    });

    return (
      <View>
        <View style={{ marginLeft: LEFT_MARGIN }}>{events}</View>
      </View>
    );
  }

  render() {
    const { styles } = this.props;
    return (
      <ScrollView
        ref={this.scrollViewRef}
        contentContainerStyle={[
          styles.contentStyle,
          { width: this.props.width, backgroundColor: 'rgba(5, 0, 2, 0.05)' },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {this._renderLines()}
        {this._renderEvents()}
      </ScrollView>
    );
  }
}
