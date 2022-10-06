+++
title = "Time tracking with Watson and Jira"
date = 2021-12-11
+++

In this article, I would like to present to you how I track my work and how I sync the logs to Jira.

## Watson

I try to keep of most of my workflow inside the terminal. The most fitting tool I have found was `watson`.

[https://tailordev.github.io/Watson/](https://tailordev.github.io/Watson/)

## How do I track

I chose granularity of 5 minutes. I track in retrospective, that means, in the ideal scenario when I switch tasks I log the task I just finished. Then, I am using reports of submitted logs to check my monthly balance to know if I need to work some days longer or if I have enough overtime to leave earlier.

## What do I track

Projects relate to real work projects. It is good idea to have project per technical module even if it is then uploaded to the same Jira ticket. Activities out of the scope of these projects I track under project named “none”.

**Significant tags** are used to instruct the synchronization tool with which Jira tickets it should upload the logs. The structure will depend on your company’s way of doing things. In my case, the following schema has emerged:

* **sprint** - activities that belong to specific tasks in the sprint
* **other** - activities that do not have specific task and are all reported to one general Jira ticket
* **vacation & sick** - in our case, we track vacation and sick leaves in Jira as well
* **break** - at the end, it has no meaning for the end-report, but it helps with reviewing the logs of the day to see there is no “missed spot”

Action tags describe repeating activities. They will vary for everyone. Just to inspire you, as a software engineer, I have identified following action tags:

 * **code** - casual implementation and writing automation tests. Also including git and PR actions.
 * **review** - reviewing other colleagues PRs
 * **qa** - quality assurance is about manually verifying the acceptance criteria
 * **docs** - used if I spent significant amount of time on documentation that I do not consider as part of the coding
 * **research** -used in case task requires some time for reading and preparation
 * **spec** - taking time for writing functional or technical specification for the Jira tickets
 * **sync** - very often used tag for logging ad hoc discussions
 * **meeting** - used for reoccurring meetings and scrum ceremonies
 * **env - action important as any other** - logs time spent setting, fixing and tweaking tools I work with
 * **buzz** - checking slack, emails, answering some questions and just general buzz that fills the gaps between task-focused work

## Environment setup

I usually have one tmux window named “reporting” which is divided to 2 panes. One pane shows the logs of the current week, and the other pane I use for writing `watson` commands.

I am using `entr` to watch the Watson’s frames and to automatically rerun a script which does a custom print pf the logs.

```bash
#!/bin/bash
ls "$HOME/.config/watson/frames" | entr -cr "$HOME/reporting/current-script"
```

`current-script` prints separately today’s breaks and underneath logs for selected projects in the current week time frame.

```bash
#!/bin/bash
echo "--------------------------------------------------"
echo " Break"
echo "--------------------------------------------------"
watson log -c -d -G --no-pager -p break
echo
echo "--------------------------------------------------"
echo " Current"
echo "--------------------------------------------------"
watson log -c -w -G --no-pager -p project1 -p project2 -p none
```

For issuing `watson` commands I have created a bunch of scripts and heir aliases in `.bashrc`.

```bash
alias @ws="$HOME/reporting/watson-add-project1-sprint.sh"
alias @wo="$HOME/reporting/watson-add-project1-other.sh"
alias @fs="$HOME/reporting/watson-add-project2-sprint.sh"
alias @fo="$HOME/reporting/watson-add-project2-other.sh"
alias @n="$HOME/reporting/watson-add-none.sh"
alias @b="$HOME/reporting/watson-add-break.sh"
alias @="watson"
```

Example for `watson-add-project1-sprint.sh`.

```bash
#!/bin/bash
DIR="$HOME/reporting"

FROM="$1"
TO="$2"
LOG="${@:3}"

FROM_DATE=`$DIR/d "$FROM"`
TO_DATE=`$DIR/d "$TO"`
watson add -f $FROM_DATE -t $TO_DATE project1 +sprint $LOG
```

The `d` takes advantage of `date` utility which can parse relative dates and produce date in format that `watson` expects. Then instead of specifying full date `2021-12-12 10:00` I can just write time for current day `10:00` or relative date `yesterday 10:00`.

```bash
#!/bin/bash
date -d "$1" '+%FT%T'
```

Then a usual log commands look like this.

```bash
@ws 14:00 15:15 +JIRA-1234 +code
@wo 15:15 15:40 +sync
@b 15:40 16:05
```

## Synchronization with Jira

`watson-jira-next` is a tool I use for syncing logs to Jira via REST calls. I have extended already existing `watson-jira` project, which, unfortunately, seem to become abandoned.

[github:PrimaMateria/watson-jira-next](https://github.com/PrimaMateria/watson-jira-next)

All the important information you can find in the project’s README. Just to give you a short preview, this is the configuration file which is set for my significant tags.

```yaml
jira:
  server: {{ JIRA_URL }}
  cookie: {{ COOKIE }}
mappings:
  - name: sprint
    type: issue_specified_in_tag
  - name: sick
    type: single_issue
    issue: {{ JIRA_TICKET_SICK_LEAVE }}
  - name: vacation
    type: single_issue
    issue: {{ JIRA_TICKET_VACATION }}
  - name: other
    type: issue_per_project
    projects:
      none: {{ JIRA_TICKET_GENERAL }}
      project1: {{ JIRA_TICKET_GENERAL_PROJECT1 }}
      project2: {{ JIRA_TICKET_GENERAL_PROJECT2 }}
```

## Outro

At the end, time tracking data are not only for the month-end report, but they also provide you insight about the modules and allows you to reflect about your job — e.g. how much time spent coding, testing, researching, or discussing with others.

Thank you for reading. I hope `watson` and `watson-jira` will help you in your daily work.

