const getReminderTime = (actual, timeToTravel) => {
  let temp = parseInt(actual[0]) * 60 * 60 + parseInt(actual[1]) * 60;
  temp -= timeToTravel;
  // checking if date is not valid
  let curr = new Date();
  curr = curr.getHours() * 60 * 60 + curr.getMinutes() * 60;
  if (temp - curr < 0) return false;

  let hrs = Math.floor(temp / 3600);
  let mins = (temp / 3600 - hrs) * 60;
  return [hrs, Math.floor(mins)];
};

module.exports = { getReminderTime };
