module.exports = {
  timeSort: function(visits) {
    visits.map(function(visit) {
      // visit.date = parseDate(visit.start);
      // visit.startTime = parseTime(visit.start);
      // visit.endTime = parseTime(visit.end);
    });
    visits.sort(function(a, b) {
      return a.start - b.start;
    });
    return visits;
  }
};
